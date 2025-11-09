from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from redis import Redis
import requests
import time
import json
import os
from typing import Optional

app = FastAPI(title="LoL Match Tracker", version="1.0.0")

# -------------------------------
# CONFIGURATION
# -------------------------------
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_DB = int(os.getenv("REDIS_DB", 0))

RIOT_API_KEY = os.getenv("RIOT_API_KEY", "")
RIOT_MATCH_URL = (
    "https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids"
)
RIOT_MATCH_DETAIL_URL = (
    "https://americas.api.riotgames.com/lol/match/v5/matches/{match_id}"
)

RATE_LIMIT = int(os.getenv("RATE_LIMIT", 10))  # max requests per second

# -------------------------------
# REDIS SETUP
# -------------------------------
redis = Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB, decode_responses=True)

# Queues
UNSTARTED_QUEUE = "queue:unstarted"
ONGOING_QUEUE = "queue:ongoing"


# -------------------------------
# MODELS
# -------------------------------
class TrackMatchRequest(BaseModel):
    puuids: list[str]
    lobbyId: int
    webhooks: dict


class TrackMatchResponse(BaseModel):
    status: str
    message: str


class HealthResponse(BaseModel):
    status: str
    redis_connected: bool
    unstarted_count: int
    ongoing_count: int


# -------------------------------
# HELPER FUNCTIONS
# -------------------------------
def push_unstarted(match_data: dict):
    """Add match to unstarted queue"""
    redis.rpush(UNSTARTED_QUEUE, json.dumps(match_data))


def pop_unstarted() -> Optional[dict]:
    """Get next unstarted match"""
    data = redis.lpop(UNSTARTED_QUEUE)
    return json.loads(data) if data else None


def push_ongoing(match_data: dict):
    """Add match to ongoing queue"""
    redis.rpush(ONGOING_QUEUE, json.dumps(match_data))


def pop_ongoing() -> Optional[dict]:
    """Get next ongoing match"""
    data = redis.lpop(ONGOING_QUEUE)
    return json.loads(data) if data else None


def get_queue_length(queue_name: str) -> int:
    """Get length of a queue"""
    return redis.llen(queue_name)


def send_webhook(webhook_url: str, payload: dict) -> bool:
    """Send webhook notification to backend"""
    try:
        resp = requests.post(webhook_url, json=payload, timeout=10)
        resp.raise_for_status()
        print(f"Webhook sent successfully: {payload}")
        return True
    except Exception as e:
        print(f"Webhook failed for {webhook_url}: {e}")
        return False


def get_latest_match(puuid: str) -> Optional[str]:
    """Get latest match ID for a PUUID"""
    url = RIOT_MATCH_URL.format(puuid=puuid)
    headers = {"X-Riot-Token": RIOT_API_KEY}
    params = {"start": 0, "count": 1}

    try:
        resp = requests.get(url, headers=headers, params=params, timeout=10)
        if resp.status_code == 200:
            matches = resp.json()
            return matches[0] if matches else None
        elif resp.status_code == 429:
            print(f"Rate limited by Riot API")
            return None
        else:
            print(f"Riot API error {resp.status_code}: {resp.text}")
            return None
    except Exception as e:
        print(f"Error fetching match for {puuid}: {e}")
        return None


def check_match_status(match_id: str) -> Optional[dict]:
    """Check if match has ended by fetching match details"""
    url = RIOT_MATCH_DETAIL_URL.format(match_id=match_id)
    headers = {"X-Riot-Token": RIOT_API_KEY}

    try:
        resp = requests.get(url, headers=headers, timeout=10)
        if resp.status_code == 200:
            match_data = resp.json()
            # If we can fetch match details, the match has ended
            return {
                "ended": True,
                "game_duration": match_data.get("info", {}).get("gameDuration"),
                "game_mode": match_data.get("info", {}).get("gameMode"),
            }
        elif resp.status_code == 404:
            # Match not found yet, still ongoing
            return {"ended": False}
        elif resp.status_code == 429:
            print(f"Rate limited checking match {match_id}")
            return None
        else:
            print(f"Error checking match {match_id}: {resp.status_code}")
            return None
    except Exception as e:
        print(f"Exception checking match {match_id}: {e}")
        return None


# -------------------------------
# TRACKING LOOP
# -------------------------------
def process_matches():
    """
    Sequentially track matches:
    - Move unstarted -> ongoing when a match starts
    - Move ongoing -> completed when match ends
    - Notify backend via webhook at each stage
    """
    last_request_time = 0
    print("Match tracking loop started")

    while True:
        try:
            # Process unstarted queue
            match = pop_unstarted()
            if match:
                print(f"Processing unstarted match for lobby {match['lobby_id']}")
                any_started = False
                latest_match_id = None

                for puuid in match["puuids"]:
                    # Rate limiting
                    elapsed = time.time() - last_request_time
                    if elapsed < 1 / RATE_LIMIT:
                        time.sleep((1 / RATE_LIMIT) - elapsed)
                    last_request_time = time.time()

                    match_id = get_latest_match(puuid)
                    if match_id:
                        latest_match_id = match_id
                        any_started = True
                        print(
                            f"Match started for lobby {match['lobby_id']}: {match_id}"
                        )
                        break  # Found a match, no need to check other PUUIDs

                if any_started and latest_match_id:
                    match["match_id"] = latest_match_id
                    match["started_at"] = time.time()
                    push_ongoing(match)

                    payload = {
                        "lobbyId": match["lobby_id"],
                        "riotMatchId": latest_match_id,
                    }
                    if not send_webhook(match["webhook_started"], payload):
                        print(
                            f"Webhook failed for lobby {match['lobby_id']}, will retry"
                        )
                else:
                    # No match started yet, push back to unstarted
                    push_unstarted(match)

            # Process ongoing queue
            ongoing = pop_ongoing()
            if ongoing:
                match_id = ongoing.get("match_id")
                if not match_id:
                    print(
                        f"Warning: ongoing match for lobby {ongoing['lobby_id']} has no match_id"
                    )
                    continue

                # Rate limiting
                elapsed = time.time() - last_request_time
                if elapsed < 1 / RATE_LIMIT:
                    time.sleep((1 / RATE_LIMIT) - elapsed)
                last_request_time = time.time()

                match_status = check_match_status(match_id)

                if match_status is None:
                    # Error checking status, push back and retry
                    push_ongoing(ongoing)
                elif match_status.get("ended"):
                    # Match has ended
                    print(f"Match ended for lobby {ongoing['lobby_id']}: {match_id}")
                    payload = {"lobbyId": ongoing["lobby_id"], "riotMatchId": match_id}
                    if not send_webhook(ongoing["webhook_completed"], payload):
                        print(f"Webhook failed for completed match, will retry")
                        push_ongoing(ongoing)
                else:
                    # Still ongoing, push back
                    push_ongoing(ongoing)

            # Sleep between iterations to prevent tight loop
            if not match and not ongoing:
                time.sleep(2)  # No work, sleep longer
            else:
                time.sleep(0.5)  # Have work, sleep shorter

        except Exception as e:
            print(f"Error in tracking loop: {e}")
            time.sleep(5)  # Sleep on error to prevent spam


# -------------------------------
# API ENDPOINTS
# -------------------------------
@app.get("/", response_model=dict)
def read_root():
    """Root endpoint"""
    return {"service": "LoL Match Tracker", "version": "1.0.0", "status": "running"}


@app.get("/health", response_model=HealthResponse)
def health_check():
    """Health check endpoint"""
    try:
        redis.ping()
        redis_connected = True
    except:
        redis_connected = False

    return {
        "status": "healthy" if redis_connected else "unhealthy",
        "redis_connected": redis_connected,
        "unstarted_count": get_queue_length(UNSTARTED_QUEUE),
        "ongoing_count": get_queue_length(ONGOING_QUEUE),
    }


@app.post("/track_match", response_model=TrackMatchResponse)
def track_match(req: TrackMatchRequest):
    """
    Start tracking a match for given PUUIDs

    - **puuids**: List of player PUUIDs to track
    - **webhooks**: Dictionary with matchStarted and matchCompleted URLs
    - **lobbyId**: Lobby identifier for tracking
    """
    if not req.puuids or not req.webhooks:
        raise HTTPException(status_code=400, detail="puuids and webhooks required")

    if not RIOT_API_KEY:
        raise HTTPException(status_code=500, detail="Riot API key not configured")

    match_data = {
        "puuids": req.puuids,
        "webhook_started": req.webhooks.get("matchStarted"),
        "webhook_completed": req.webhooks.get("matchCompleted"),
        "lobby_id": req.lobbyId,
        "match_id": None,
        "created_at": time.time(),
    }

    push_unstarted(match_data)

    return {
        "status": "queued",
        "message": f"Match tracking queued for lobby {req.lobbyId}",
    }


@app.delete("/clear_queues")
def clear_queues():
    """Clear all queues (for testing/debugging)"""
    unstarted_count = redis.delete(UNSTARTED_QUEUE)
    ongoing_count = redis.delete(ONGOING_QUEUE)
    return {
        "message": "Queues cleared",
        "unstarted_cleared": unstarted_count,
        "ongoing_cleared": ongoing_count,
    }


# -------------------------------
# START TRACKING LOOP
# -------------------------------
import threading

tracking_thread = threading.Thread(target=process_matches, daemon=True)
tracking_thread.start()

print("FastAPI Match Tracker started")
