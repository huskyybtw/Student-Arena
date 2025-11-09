"use client";

import { useMatchControllerFindMatch } from "@/lib/api/match/match";
import { MatchSummary } from "@/components/matches/match-summary";
import { ParticipantsTable } from "@/components/matches/participants-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface MatchDetailsProps {
  matchId: string;
}

export function MatchDetails({ matchId }: MatchDetailsProps) {
  const { data, isLoading, error } = useMatchControllerFindMatch({
    lobbyId: Number(matchId),
  });

  const match = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground mb-4">
            Nie znaleziono meczu lub mecz jeszcze się nie rozpoczął
          </p>
          <Link href="/matches">
            <Button variant="secondary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Powrót do listy gier
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const isCompleted = match.duration !== null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/matches">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Powrót
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Szczegóły Meczu</h1>
          <p className="text-sm text-muted-foreground">
            Match ID: {match.riotMatchId}
          </p>
        </div>
      </div>

      {/* Match Summary */}
      <MatchSummary
        participants={match.participants}
        duration={match.duration ?? null}
        winningTeam={match.winningTeam ?? null}
      />

      {/* Participants Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ParticipantsTable
          participants={match.participants}
          teamId={100}
          teamName="Niebieska Drużyna"
          isCompleted={isCompleted}
        />
        <ParticipantsTable
          participants={match.participants}
          teamId={200}
          teamName="Czerwona Drużyna"
          isCompleted={isCompleted}
        />
      </div>
    </div>
  );
}
