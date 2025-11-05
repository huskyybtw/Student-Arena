"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Shield, Trophy, X, Target, Clock } from "lucide-react";
import { TeamResponseDto } from "@/lib/api/model";

interface TeamInfoStatsProps {
  team: TeamResponseDto;
}

export function TeamInfoStats({ team }: TeamInfoStatsProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Informacje i Statystyki</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="border-b pb-3">
          <p
            className={`text-sm text-muted-foreground break-words ${
              !isDescriptionExpanded ? "line-clamp-2" : ""
            }`}
          >
            {team.description}
          </p>
          {team.description.length > 100 && (
            <button
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="text-xs text-primary hover:underline mt-1"
            >
              {isDescriptionExpanded ? "Pokaż mniej" : "Pokaż więcej"}
            </button>
          )}
        </div>

        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg px-3 py-1 mb-2">
            <Shield className="h-4 w-4 text-yellow-500" />
            <span className="font-bold text-sm">Rating: {team.rating}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {team.members.length}/5 Członków
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="text-center bg-muted/50 rounded-lg p-2">
            <div className="text-sm font-bold">-</div>
            <div className="text-xs text-muted-foreground">Turnieje</div>
          </div>
          <div className="text-center bg-muted/50 rounded-lg p-2">
            <div className="text-sm font-bold">-</div>
            <div className="text-xs text-muted-foreground">Win Rate</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted/50 rounded-lg p-2">
            <div className="flex items-center justify-between mb-1">
              <Trophy className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="text-sm font-bold">-</div>
            <div className="text-xs text-muted-foreground">Wygrane</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <div className="flex items-center justify-between mb-1">
              <X className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="text-sm font-bold">-</div>
            <div className="text-xs text-muted-foreground">Przegrane</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <div className="flex items-center justify-between mb-1">
              <Target className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="text-sm font-bold">-</div>
            <div className="text-xs text-muted-foreground">Średnie KDA</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <div className="flex items-center justify-between mb-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="text-sm font-bold">-</div>
            <div className="text-xs text-muted-foreground">Mecze</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TeamInfoStatsSkeleton() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-24 w-full" />
      </CardContent>
    </Card>
  );
}
