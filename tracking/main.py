from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from redis import Redis
import requests
import time
import json
import os
import logging
from typing import Optional

# -------------------------------
# LOGGING CONFIGURATION
# -------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - [%(funcName)s:%(lineno)d] - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logger = logging.getLogger(__name__)

app = FastAPI(title="LoL Match Tracker", version="1.0.0")

# -------------------------------
# CONFIGURATION
# -------------------------------
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_DB = int(os.getenv("REDIS_DB", 0))

RIOT_API_KEY = os.getenv("RIOT_API_KEY", "")
RIOT_MATCH_URL = (
    "https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids"
)
RIOT_MATCH_DETAIL_URL = (
    "https://europe.api.riotgames.com/lol/match/v5/matches/{match_id}"
)

PLATFORM = os.getenv("RIOT_PLATFORM", "eun1")
SUMMONER_BY_PUUID_URL_TEMPLATE = (
    "https://{platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{puuid}"
)
SPECTATOR_ACTIVE_URL_TEMPLATE = "https://{platform}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/{summoner_id}"

RATE_LIMIT = int(os.getenv("RATE_LIMIT", 1))  # max requests per second

logger.info(
    f"Configuration loaded - Redis: {REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}, Rate limit: {RATE_LIMIT}/s"
)

# -------------------------------
# REDIS SETUP
# -------------------------------
redis = Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB, decode_responses=True)

# Queues
UNSTARTED_QUEUE = "queue:unstarted"
ONGOING_QUEUE = "queue:ongoing"
TRACKING_SET = "set:tracking_lobbies"  # Set of lobby IDs currently being tracked


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
def is_lobby_tracked(lobby_id: int) -> bool:
    """Check if lobby is already being tracked"""
    return redis.sismember(TRACKING_SET, str(lobby_id))


def add_lobby_to_tracking(lobby_id: int):
    """Mark lobby as being tracked"""
    redis.sadd(TRACKING_SET, str(lobby_id))


def remove_lobby_from_tracking(lobby_id: int):
    """Remove lobby from tracking set"""
    redis.srem(TRACKING_SET, str(lobby_id))


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
        logger.info(
            f"Webhook sent successfully - Lobby {payload.get('lobbyId')}, Match {payload.get('riotMatchId')}"
        )
        return True
    except Exception as e:
        logger.error(f"Webhook failed for {webhook_url}: {e}")
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
            logger.warning(
                f"Rate limited by Riot API while fetching match for PUUID {puuid[:8]}..."
            )
            return None
        else:
            logger.error(
                f"Riot API error {resp.status_code} for PUUID {puuid[:8]}...: {resp.text}"
            )
            return None
    except Exception as e:
        logger.error(f"Error fetching match for PUUID {puuid[:8]}...: {e}")
        return None


def get_summoner_by_puuid(puuid: str) -> Optional[dict]:
    """Lookup summoner object (contains encrypted summoner id) by PUUID on PLATFORM"""
    url = SUMMONER_BY_PUUID_URL_TEMPLATE.format(platform=PLATFORM, puuid=puuid)
    headers = {"X-Riot-Token": RIOT_API_KEY}
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        if resp.status_code == 200:
            return resp.json()
        elif resp.status_code == 429:
            logger.warning(f"Rate limited fetching summoner for PUUID {puuid[:8]}...")
            return None
        else:
            logger.debug(
                f"Summoner lookup returned {resp.status_code} for PUUID {puuid[:8]}: {resp.text}"
            )
            return None
    except Exception as e:
        logger.error(f"Error fetching summoner for PUUID {puuid[:8]}: {e}")
        return None


def get_active_game_for_puuid(puuid: str) -> Optional[dict]:
    """Call Spectator active-game endpoint for the given PUUID on PLATFORM.
    Returns the spectator JSON if the PUUID is in an active game, None if not or on error.
    """
    url = SPECTATOR_ACTIVE_URL_TEMPLATE.format(platform=PLATFORM, summoner_id=puuid)
    headers = {"X-Riot-Token": RIOT_API_KEY}
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        if resp.status_code == 200:
            return resp.json()
        elif resp.status_code == 404:
            # Not in an active game
            logger.debug(f"PUUID {puuid[:8]} not in active game (404)")
            return None
        elif resp.status_code == 429:
            logger.warning(f"Rate limited checking active game for {puuid[:8]}")
            return None
        else:
            logger.error(f"Error from spectator API {resp.status_code}: {resp.text}")
            return None
    except Exception as e:
        logger.error(f"Exception calling spectator API for {puuid[:8]}: {e}")
        return None


def get_active_match_by_puuid(puuid: str) -> Optional[str]:
    """High-level helper: given a PUUID, call Spectator v5 directly and return the spectator gameId as string when active, otherwise None."""
    active = get_active_game_for_puuid(puuid)
    if active:
        game_id = active.get("gameId")
        return str(game_id) if game_id else None
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
            logger.debug(f"Match {match_id} not found (404), still ongoing")
            return {"ended": False}
        elif resp.status_code == 429:
            logger.warning(f"Rate limited checking match {match_id}")
            return None
        else:
            logger.error(f"Error checking match {match_id}: {resp.status_code}")
            return None
    except Exception as e:
        logger.error(f"Exception checking match {match_id}: {e}")
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
    logger.info("Match tracking loop started")

    while True:
        try:
            # Process unstarted queue
            match = pop_unstarted()
            if match:
                logger.info(f"Processing unstarted match for lobby {match['lobby_id']}")
                any_started = False
                latest_match_id = None

                for puuid in match["puuids"]:
                    # Rate limiting
                    elapsed = time.time() - last_request_time
                    if elapsed < 1 / RATE_LIMIT:
                        time.sleep((1 / RATE_LIMIT) - elapsed)
                    last_request_time = time.time()

                    # Check if player is currently in an active game via Spectator v5 (EUN1)
                    spectator_game_id = get_active_match_by_puuid(puuid)
                    if spectator_game_id:
                        # Normalize spectator game id to the match-v5 format with region prefix
                        region_prefixed = f"{PLATFORM.upper()}_{spectator_game_id}"
                        latest_match_id = region_prefixed
                        any_started = True
                        logger.info(
                            f"Spectator active game detected for lobby {match['lobby_id']}: {region_prefixed}"
                        )
                        break  # Found an active game, no need to check other PUUIDs

                if any_started and latest_match_id:
                    # We detected an active game via Spectator. The official match-v5 id
                    # may not be available until the game ends and is processed by Riot.
                    # Store spectator id and mark started_by_spectator so we can resolve
                    # the final match-v5 id later.
                    match["match_id"] = None
                    match["started_at"] = time.time()
                    match["started_by_spectator"] = True
                    match["spectator_game_id"] = spectator_game_id
                    match["riot_match_id"] = latest_match_id
                    push_ongoing(match)

                    # Notify backend immediately with the spectator game id
                    payload = {
                        "lobbyId": match["lobby_id"],
                        "riotMatchId": latest_match_id,
                    }
                    if not send_webhook(match["webhook_started"], payload):
                        logger.warning(
                            f"Webhook failed for lobby {match['lobby_id']}, will retry"
                        )
                else:
                    # No match started yet, push back to unstarted
                    push_unstarted(match)

            # Process ongoing queue
            ongoing = pop_ongoing()
            if ongoing:
                # Prefer explicit riot_match_id (may be a region-prefixed spectator id)
                match_id = ongoing.get("riot_match_id") or ongoing.get("match_id")

                if not match_id:
                    # If the match was started by spectator we expect a region-prefixed
                    # riot_match_id to be present (we stored it when detecting via spectator).
                    # If it's not available yet, just requeue and retry later.
                    if ongoing.get("started_by_spectator"):
                        logger.info(
                            f"Lobby {ongoing['lobby_id']} started by spectator but no riot_match_id yet; retrying later"
                        )
                        push_ongoing(ongoing)
                        continue

                    # Fallback: try to resolve final match-v5 id by querying recent matches
                    resolved = None
                    for puuid in ongoing["puuids"]:
                        # Rate limiting
                        elapsed = time.time() - last_request_time
                        if elapsed < 1 / RATE_LIMIT:
                            time.sleep((1 / RATE_LIMIT) - elapsed)
                        last_request_time = time.time()

                        candidate = get_latest_match(puuid)
                        if candidate:
                            resolved = candidate
                            break

                    if resolved:
                        ongoing["match_id"] = resolved
                        match_id = resolved
                        logger.info(
                            f"Resolved match-v5 id for lobby {ongoing['lobby_id']}: {resolved}"
                        )
                    else:
                        # Not yet available via match-v5, retry later
                        push_ongoing(ongoing)
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
                    logger.info(
                        f"Match ended for lobby {ongoing['lobby_id']}: {match_id}"
                    )
                    payload = {"lobbyId": ongoing["lobby_id"], "riotMatchId": match_id}
                    if not send_webhook(ongoing["webhook_completed"], payload):
                        logger.warning(
                            f"Webhook failed for completed match, will retry"
                        )
                        push_ongoing(ongoing)
                    else:
                        # Successfully completed, remove from tracking set
                        remove_lobby_from_tracking(ongoing["lobby_id"])
                        logger.info(
                            f"Lobby {ongoing['lobby_id']} removed from tracking"
                        )
                else:
                    # Still ongoing, push back
                    push_ongoing(ongoing)

            # Sleep between iterations to prevent tight loop
            if not match and not ongoing:
                time.sleep(2)  # No work, sleep longer
            else:
                time.sleep(0.5)  # Have work, sleep shorter

        except Exception as e:
            logger.error(f"Error in tracking loop: {e}")
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
        logger.warning(
            f"Invalid track_match request: missing puuids or webhooks for lobby {req.lobbyId}"
        )
        raise HTTPException(status_code=400, detail="puuids and webhooks required")

    if not RIOT_API_KEY:
        logger.error("Riot API key not configured")
        raise HTTPException(status_code=500, detail="Riot API key not configured")

    # Check if lobby is already being tracked
    if is_lobby_tracked(req.lobbyId):
        logger.warning(f"Lobby {req.lobbyId} is already being tracked")
        raise HTTPException(
            status_code=409, detail=f"Lobby {req.lobbyId} is already being tracked"
        )

    match_data = {
        "puuids": req.puuids,
        "webhook_started": req.webhooks.get("matchStarted"),
        "webhook_completed": req.webhooks.get("matchCompleted"),
        "lobby_id": req.lobbyId,
        "match_id": None,
        "created_at": time.time(),
    }

    push_unstarted(match_data)
    add_lobby_to_tracking(req.lobbyId)
    logger.info(
        f"Match tracking queued for lobby {req.lobbyId} with {len(req.puuids)} players"
    )

    return {
        "status": "queued",
        "message": f"Match tracking queued for lobby {req.lobbyId}",
    }


@app.delete("/clear_queues")
def clear_queues():
    """Clear all queues (for testing/debugging)"""
    unstarted_count = redis.delete(UNSTARTED_QUEUE)
    ongoing_count = redis.delete(ONGOING_QUEUE)
    tracking_count = redis.delete(TRACKING_SET)
    logger.info(
        f"Queues cleared - Unstarted: {unstarted_count}, Ongoing: {ongoing_count}, Tracking: {tracking_count}"
    )
    return {
        "message": "Queues cleared",
        "unstarted_cleared": unstarted_count,
        "ongoing_cleared": ongoing_count,
        "tracking_cleared": tracking_count,
    }


@app.get("/is_tracking/{lobby_id}")
def check_tracking(lobby_id: int):
    """Check if a lobby is currently being tracked"""
    is_tracked = is_lobby_tracked(lobby_id)
    return {
        "lobby_id": lobby_id,
        "is_tracked": is_tracked,
    }


# -------------------------------
# START TRACKING LOOP
# -------------------------------
import threading

tracking_thread = threading.Thread(target=process_matches, daemon=True)
tracking_thread.start()

logger.info("FastAPI Match Tracker started successfully")
