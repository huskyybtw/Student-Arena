"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Trophy, X } from "lucide-react";

interface Match {
  id: number;
  result: "win" | "loss";
  opponent: string;
  score: string;
  duration: string;
  ratingChange: string;
  timestamp: string;
}

interface TeamMatchHistoryProps {
  matches: Match[];
}

export function TeamMatchHistory({ matches }: TeamMatchHistoryProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Historia Meczy
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {matches.map((match) => (
            <div
              key={match.id}
              className="flex items-center justify-between p-2 rounded-lg border border-border bg-card/50 hover:bg-card/70 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-1 rounded ${
                    match.result === "win"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {match.result === "win" ? (
                    <Trophy className="h-3 w-3" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                </div>

                <div>
                  <div className="font-medium text-xs">vs {match.opponent}</div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <span className="font-mono">{match.score}</span>
                    <span>•</span>
                    <span>{match.duration}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div
                  className={`text-xs font-bold px-2 py-1 rounded text-white ${
                    match.result === "win" ? "bg-green-600" : "bg-red-600"
                  }`}
                >
                  {match.ratingChange}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TeamMatchHistorySkeleton() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
