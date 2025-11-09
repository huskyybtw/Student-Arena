"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MatchParticipantResponseDto } from "@/lib/api/model";

interface MatchSummaryProps {
  participants: MatchParticipantResponseDto[];
  duration: number | null;
  winningTeam: number | null;
}

export function MatchSummary({
  participants,
  duration,
  winningTeam,
}: MatchSummaryProps) {
  const team1 = participants.filter((p) => p.teamId === 100);
  const team2 = participants.filter((p) => p.teamId === 200);

  const team1Kills = team1.reduce((sum, p) => sum + (p.kills || 0), 0);
  const team2Kills = team2.reduce((sum, p) => sum + (p.kills || 0), 0);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isCompleted = duration !== null;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Podsumowanie Meczu</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isCompleted ? (
          <>
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  Niebieska Drużyna
                </p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-2xl font-bold">{team1Kills}</p>
                  {winningTeam === 100 && (
                    <Badge className="bg-green-500 hover:bg-green-600">
                      ZWYCIĘSTWO
                    </Badge>
                  )}
                </div>
              </div>

              <div className="px-4">
                <p className="text-muted-foreground">vs</p>
              </div>

              <div className="text-center flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  Czerwona Drużyna
                </p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-2xl font-bold">{team2Kills}</p>
                  {winningTeam === 200 && (
                    <Badge className="bg-green-500 hover:bg-green-600">
                      ZWYCIĘSTWO
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Czas trwania: {formatDuration(duration)}
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-lg py-2 px-4">
              MECZ W TRAKCIE
            </Badge>
            <p className="text-sm text-muted-foreground mt-2">
              Statystyki będą dostępne po zakończeniu meczu
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
