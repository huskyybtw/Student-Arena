"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Clock, LogOut, Plus, Edit2 } from "lucide-react";

export default function MatchDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [lobbyStatus, setLobbyStatus] = useState<
    "SCHEDULED" | "ONGOING" | "COMPLETED"
  >("SCHEDULED");
  const [userReady, setUserReady] = useState(false);
  const [isUserInLobby] = useState(true);
  const [isOwner] = useState(false);

  const matchParticipants = [
    {
      id: 1,
      playerName: "Player One",
      championId: 1,
      role: "TOP",
      kills: 5,
      deaths: 2,
      assists: 8,
      cs: 234,
      goldEarned: 12500,
      items: [3025, 3026, 3033, 3031, 3036, 3009],
      team: 1,
    },
    {
      id: 2,
      playerName: "Player Two",
      championId: 64,
      role: "JUNGLE",
      kills: 8,
      deaths: 3,
      assists: 12,
      cs: 145,
      goldEarned: 11200,
      items: [3020, 3071, 3025, 3143, 3031, 3115],
      team: 1,
    },
    {
      id: 3,
      playerName: "Player Three",
      championId: 105,
      role: "MID",
      kills: 12,
      deaths: 1,
      assists: 15,
      cs: 289,
      goldEarned: 14800,
      items: [3089, 3040, 3135, 3089, 3031, 3009],
      team: 1,
    },
    {
      id: 4,
      playerName: "Player Four",
      championId: 202,
      role: "CARRY",
      kills: 10,
      deaths: 2,
      assists: 10,
      cs: 312,
      goldEarned: 15900,
      items: [3031, 3036, 3071, 3072, 3026, 3009],
      team: 1,
    },
    {
      id: 5,
      playerName: "Player Five",
      championId: 40,
      role: "SUPPORT",
      kills: 1,
      deaths: 5,
      assists: 25,
      cs: 32,
      goldEarned: 8900,
      items: [3050, 3143, 3504, 3855, 3860, 3009],
      team: 1,
    },
    {
      id: 6,
      playerName: "Enemy Player One",
      championId: 2,
      role: "TOP",
      kills: 3,
      deaths: 6,
      assists: 5,
      cs: 201,
      goldEarned: 10800,
      items: [3025, 3133, 3031, 3009, 0, 0],
      team: 2,
    },
    {
      id: 7,
      playerName: "Enemy Player Two",
      championId: 11,
      role: "JUNGLE",
      kills: 4,
      deaths: 7,
      assists: 8,
      cs: 98,
      goldEarned: 9200,
      items: [3020, 3143, 3025, 3031, 0, 0],
      team: 2,
    },
    {
      id: 8,
      playerName: "Enemy Player Three",
      championId: 127,
      role: "MID",
      kills: 6,
      deaths: 5,
      assists: 10,
      cs: 198,
      goldEarned: 11500,
      items: [3089, 3040, 3031, 3009, 0, 0],
      team: 2,
    },
    {
      id: 9,
      playerName: "Enemy Player Four",
      championId: 67,
      role: "CARRY",
      kills: 7,
      deaths: 4,
      assists: 8,
      cs: 256,
      goldEarned: 13200,
      items: [3031, 3036, 3071, 3031, 0, 0],
      team: 2,
    },
    {
      id: 10,
      playerName: "Enemy Player Five",
      championId: 16,
      role: "SUPPORT",
      kills: 0,
      deaths: 8,
      assists: 18,
      cs: 22,
      goldEarned: 7800,
      items: [3050, 3143, 3504, 0, 0, 0],
      team: 2,
    },
  ];

  const matchData = {
    id: Number.parseInt(params.id),
    title: "UW Legends szuka Supportu",
    matchType: "Team",
    status: lobbyStatus,
    ranked: true,
    players: 4,
    maxPlayers: 10,
    date: new Date(Date.now() + 30 * 60000),
    description: "Szukamy dobrego Supportu do rankingów. Wymagana komunikacja.",
    owner: { name: "TeamOwner", rating: 1400 },
    duration: 1847,
    winningTeam: 1,
    teams: [
      {
        id: 1,
        name: "Team Blue",
        players: [
          {
            id: 1,
            name: "Player One",
            rating: 1200,
            primaryRole: "TOP",
            secondaryRole: "MID",
            avatar: "/placeholder.svg",
            ready: true,
          },
          {
            id: 2,
            name: "Player Two",
            rating: 1150,
            primaryRole: "JUNGLE",
            secondaryRole: "MID",
            avatar: "/placeholder.svg",
            ready: false,
          },
          {
            id: 3,
            name: "Player Three",
            rating: 1100,
            primaryRole: "MID",
            secondaryRole: "SUPPORT",
            avatar: "/placeholder.svg",
            ready: true,
          },
          {
            id: 4,
            name: "Player Four",
            rating: 1050,
            primaryRole: "CARRY",
            secondaryRole: "JUNGLE",
            avatar: "/placeholder.svg",
            ready: false,
          },
          {
            id: 5,
            name: "Player Five",
            rating: 950,
            primaryRole: "SUPPORT",
            secondaryRole: "TOP",
            avatar: "/placeholder.svg",
            ready: false,
          },
        ],
      },
      {
        id: 2,
        name: "Team Red",
        players: [
          {
            id: 6,
            name: "Enemy Player One",
            rating: 1180,
            primaryRole: "TOP",
            secondaryRole: "MID",
            avatar: "/placeholder.svg",
            ready: true,
          },
          {
            id: 7,
            name: "Enemy Player Two",
            rating: 1130,
            primaryRole: "JUNGLE",
            secondaryRole: "SUPPORT",
            avatar: "/placeholder.svg",
            ready: false,
          },
          {
            id: 8,
            name: "Enemy Player Three",
            rating: 1080,
            primaryRole: "MID",
            secondaryRole: "CARRY",
            avatar: "/placeholder.svg",
            ready: true,
          },
          {
            id: 9,
            name: "Enemy Player Four",
            rating: 1030,
            primaryRole: "CARRY",
            secondaryRole: "MID",
            avatar: "/placeholder.svg",
            ready: false,
          },
          {
            id: 10,
            name: "Enemy Player Five",
            rating: 920,
            primaryRole: "SUPPORT",
            secondaryRole: "JUNGLE",
            avatar: "/placeholder.svg",
            ready: true,
          },
        ],
      },
    ],
  };

  const roleLabels: Record<string, string> = {
    TOP: "Top",
    JUNGLE: "Jungle",
    MID: "Mid",
    CARRY: "ADC",
    SUPPORT: "Support",
  };

  const getTimeUntilMatch = (date: Date) => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    if (diffMs < 0) return "Trwa teraz";
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `za ${diffMins} minut`;
    const diffHours = Math.floor(diffMins / 60);
    return `za ${diffHours} godzin`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const getBannerStyle = () => {
    switch (matchData.status) {
      case "SCHEDULED":
        return "bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-blue-500/50 animate-pulse";
      case "ONGOING":
        return "bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/50 animate-pulse";
      case "COMPLETED":
        return "bg-gradient-to-r from-gray-600/20 to-slate-600/20 border-gray-500/50";
      default:
        return "";
    }
  };

  const getStatusInfo = () => {
    switch (matchData.status) {
      case "SCHEDULED":
        return { text: "Zaplanowana", color: "bg-blue-600" };
      case "ONGOING":
        return { text: "W trakcie", color: "bg-green-600" };
      case "COMPLETED":
        return { text: "Ukończona", color: "bg-gray-600" };
      default:
        return { text: "", color: "" };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div
            className={`rounded-lg p-6 border transition-all duration-300 ${getBannerStyle()}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status gry</p>
                <h2 className="text-3xl font-bold">{matchData.title}</h2>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className={getStatusInfo().color}>
                  {getStatusInfo().text}
                </Badge>
                {matchData.ranked && (
                  <Badge variant="default" className="text-xs">
                    Ranked
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Header with title and description */}
          <div>
            <p className="text-muted-foreground">{matchData.description}</p>
          </div>

          <div className="flex items-center gap-6 flex-wrap text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">
                {matchData.players}/{matchData.maxPlayers} graczy
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{getTimeUntilMatch(matchData.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs font-medium">
                {matchData.matchType === "Team" ? "Zespołowe" : "Dobierane"}
              </span>
            </div>
          </div>

          {matchData.status === "COMPLETED" && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle>
                  Wyniki meczu - {formatDuration(matchData.duration || 0)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2].map((teamId) => {
                    const teamParticipants = matchParticipants.filter(
                      (p) => p.team === teamId
                    );
                    const isWinner = teamId === matchData.winningTeam;
                    return (
                      <div
                        key={teamId}
                        className={`rounded-lg border p-4 ${
                          isWinner
                            ? "bg-green-500/10 border-green-500/30"
                            : "bg-red-500/10 border-red-500/30"
                        }`}
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <h3
                            className={`font-bold text-lg ${
                              isWinner ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {isWinner ? "WYGRANA" : "PRZEGRANA"}
                          </h3>
                          <Badge variant={isWinner ? "default" : "secondary"}>
                            Drużyna {teamId === 1 ? "Niebieska" : "Czerwona"}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {teamParticipants.map((participant) => (
                            <div
                              key={participant.id}
                              className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 border border-border/50"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm truncate">
                                    {participant.playerName}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className="text-xs flex-shrink-0"
                                  >
                                    {roleLabels[participant.role]}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-5 gap-2 text-xs text-muted-foreground">
                                  <div>
                                    <span className="font-semibold text-foreground">
                                      {participant.kills}
                                    </span>
                                    /
                                    <span className="text-red-400">
                                      {participant.deaths}
                                    </span>
                                    /
                                    <span className="text-yellow-400">
                                      {participant.assists}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-semibold">
                                      {participant.cs}
                                    </span>{" "}
                                    CS
                                  </div>
                                  <div>
                                    <span className="font-semibold">
                                      {(participant.goldEarned / 1000).toFixed(
                                        1
                                      )}
                                    </span>
                                    k Gold
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                {participant.items.map((itemId, idx) => (
                                  <div
                                    key={idx}
                                    className="h-8 w-8 rounded bg-muted/75 border border-border flex items-center justify-center text-xs"
                                  >
                                    {itemId ? itemId : ""}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-6">
            {matchData.teams.map((team, teamIndex) => (
              <Card key={team.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    <Badge
                      className={teamIndex === 0 ? "bg-blue-600" : "bg-red-600"}
                    >
                      {teamIndex === 0
                        ? "Niebieska drużyna"
                        : "Czerwona drużyna"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {team.players.map((player) => (
                    <div
                      key={player.id}
                      className="p-3 rounded-lg bg-muted/50 border border-border hover:bg-muted/75 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage
                              src={player.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback>{player.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {player.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {player.rating} LP
                            </p>
                          </div>
                        </div>
                        {matchData.status !== "COMPLETED" && (
                          <>
                            {player.ready ? (
                              <span className="text-lg flex-shrink-0">✓</span>
                            ) : (
                              <span className="text-lg flex-shrink-0 text-muted-foreground">
                                ○
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          {roleLabels[player.primaryRole]}
                        </Badge>
                        {player.secondaryRole && (
                          <Badge variant="outline" className="text-xs">
                            {roleLabels[player.secondaryRole]}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-3 flex-wrap">
            {matchData.status === "SCHEDULED" && (
              <>
                {isOwner && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-8 py-6 text-base bg-transparent"
                  >
                    <Edit2 className="h-5 w-5 mr-2" />
                    Edytuj grę
                  </Button>
                )}
                {isUserInLobby ? (
                  <>
                    <Button
                      size="lg"
                      onClick={() => setUserReady(!userReady)}
                      variant={userReady ? "default" : "outline"}
                      className="px-8 py-6 text-base"
                    >
                      {userReady ? "✓ Gotowy" : "Oznacz jako gotowy"}
                    </Button>
                    <Button
                      size="lg"
                      variant="destructive"
                      className="px-8 py-6 text-base"
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      Opuść grę
                    </Button>
                  </>
                ) : (
                  <Button
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 px-8 py-6 text-base"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    {matchData.matchType === "Team"
                      ? "Dołącz jako drużyna"
                      : "Dołącz do gry"}
                  </Button>
                )}
              </>
            )}
            {matchData.status === "ONGOING" && (
              <Button
                size="lg"
                variant="destructive"
                className="px-8 py-6 text-base"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Opuść grę
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
