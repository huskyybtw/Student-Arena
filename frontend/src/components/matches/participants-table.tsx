"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { MatchParticipantResponseDto } from "@/lib/api/model";

interface ParticipantsTableProps {
  participants: MatchParticipantResponseDto[];
  teamId: 100 | 200;
  teamName: string;
  isCompleted: boolean;
}

export function ParticipantsTable({
  participants,
  teamId,
  teamName,
  isCompleted,
}: ParticipantsTableProps) {
  const teamParticipants = participants.filter((p) => p.teamId === teamId);

  const getRoleIcon = (role: string) => {
    const roleMap: Record<string, string> = {
      TOP: "⬆️",
      JUNGLE: "🌳",
      MID: "⭐",
      CARRY: "🎯",
      SUPPORT: "🛡️",
    };
    return roleMap[role] || role;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>{teamName}</span>
          {teamParticipants.length > 0 && (
            <span className="text-sm text-muted-foreground font-normal">
              ({teamParticipants.length} graczy)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {teamParticipants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center gap-4 p-3 rounded-lg bg-card/50 hover:bg-card/70 transition-colors"
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {participant.playerName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">
                    {participant.playerName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {getRoleIcon(participant.role)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Champion ID: {participant.championId}
                </div>
              </div>

              {isCompleted && (
                <>
                  <div className="text-center min-w-[80px]">
                    <div className="text-sm font-medium">
                      {participant.kills}/{participant.deaths}/
                      {participant.assists}
                    </div>
                    <div className="text-xs text-muted-foreground">K/D/A</div>
                  </div>

                  <div className="text-center min-w-[60px]">
                    <div className="text-sm font-medium">{participant.cs}</div>
                    <div className="text-xs text-muted-foreground">CS</div>
                  </div>

                  <div className="text-center min-w-[80px]">
                    <div className="text-sm font-medium">
                      {participant.goldEarned?.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Gold</div>
                  </div>

                  {participant.items && participant.items.length > 0 && (
                    <div className="flex gap-1">
                      {participant.items.slice(0, 6).map((item, idx) => (
                        <div
                          key={idx}
                          className="w-6 h-6 bg-muted rounded flex items-center justify-center text-[10px]"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
