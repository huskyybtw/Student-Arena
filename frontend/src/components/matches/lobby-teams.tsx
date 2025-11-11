"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getRoleLabel } from "@/lib/utils/role-labels";
import { LobbyResponseDtoStatus } from "@/lib/api/model/lobbyResponseDtoStatus";
import type { LobbyResponseDto } from "@/lib/api/model/lobbyResponseDto";
import { RoleIcon } from "@/components/ui/role-icon";

interface LobbyTeamsProps {
  lobby: LobbyResponseDto;
}

export function LobbyTeamsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-6">
      {[1, 2].map((teamId) => (
        <Card key={teamId} className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-36 rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-muted/50 border border-border"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-5 rounded-full" />
                </div>
                <div className="flex gap-1">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function LobbyTeams({ lobby }: LobbyTeamsProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {[1, 2].map((teamId) => {
        const teamPlayers = lobby.players?.filter((p) => p.team === teamId);
        return (
          <Card key={teamId}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {teamId === 1 ? "Team Blue" : "Team Red"}
                </CardTitle>
                <Badge className={teamId === 1 ? "bg-blue-600" : "bg-red-600"}>
                  {teamId === 1 ? "Niebieska drużyna" : "Czerwona drużyna"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {teamPlayers?.map((lobbyPlayer) => (
                <div
                  key={lobbyPlayer.id}
                  className="p-3 rounded-lg bg-muted/50 border border-border hover:bg-muted/75 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>
                          {lobbyPlayer.player?.gameName?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {lobbyPlayer.player?.gameName ||
                            `User #${lobbyPlayer.player?.userId}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lobbyPlayer.player?.rating || 0} LP
                        </p>
                      </div>
                    </div>
                    {lobby.status !== LobbyResponseDtoStatus.COMPLETED && (
                      <>
                        {lobbyPlayer.ready ? (
                          <span className="text-lg flex-shrink-0">✓</span>
                        ) : (
                          <span className="text-lg flex-shrink-0 text-muted-foreground">
                            ○
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex gap-1 items-center">
                    {lobbyPlayer.player?.primaryRole && (
                      <div className="flex items-center gap-1">
                        <RoleIcon
                          role={lobbyPlayer.player.primaryRole}
                          size={14}
                        />
                        <span className="text-xs">
                          {getRoleLabel(lobbyPlayer.player.primaryRole)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
