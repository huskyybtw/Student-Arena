import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Users,
  Trophy,
  Building2,
  Clock,
  Edit,
  UserMinus,
} from "lucide-react";
import { JoinTournamentDialog } from "./join-tournament-dialog";
import { useTournamentsControllerTournament } from "@/lib/api/tournaments/tournaments";
import { useCurrentUser } from "@/lib/providers/auth-provider";

interface TournamentDetailsProps {
  tournamentId: number;
}

export function TournamentDetails({ tournamentId }: TournamentDetailsProps) {
  const { data, isLoading, error } = useTournamentsControllerTournament(tournamentId);
  const { user } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const tournament = data?.data;

  if (!tournament || error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nie znaleziono turnieju</p>
      </div>
    );
  }

  const organization = tournament.organization as
    | { id: number; name: string; ownerId: number }
    | undefined;
  const isOrganizer = user?.id === organization?.ownerId;
  const hasJoined = false; // TODO: Check if user's team has joined
  const currentTeams = tournament.lobbies?.length || 0;
  const isFull = currentTeams >= tournament.teamLimit;
  const hasStarted = new Date(tournament.startsAt) < new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {tournament.name}
            </h1>
            <Badge variant={hasStarted ? "destructive" : "default"}>
              {hasStarted ? "W trakcie" : "Nadchodzący"}
            </Badge>
            {isFull && <Badge variant="secondary">Pełny</Badge>}
          </div>
          <p className="text-muted-foreground">
            {tournament.description || "Brak opisu"}
          </p>
        </div>

        <div className="flex gap-2">
          {isOrganizer ? (
            <Button variant="secondary" size="default" className="gap-2">
              <Edit className="h-4 w-4" />
              Edytuj
            </Button>
          ) : hasJoined ? (
            <Button variant="destructive" size="default" className="gap-2">
              <UserMinus className="h-4 w-4" />
              Opuść turniej
            </Button>
          ) : (
            <JoinTournamentDialog
              tournamentId={tournament.id}
              tournamentName={tournament.name}
              disabled={isFull || hasStarted}
            />
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Data rozpoczęcia
                </p>
                <p className="text-sm font-semibold">
                  {new Date(tournament.startsAt).toLocaleDateString("pl-PL", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(tournament.startsAt).toLocaleTimeString("pl-PL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Drużyny</p>
                <p className="text-sm font-semibold">
                  {currentTeams} / {tournament.teamLimit}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tournament.teamLimit - currentTeams} wolnych miejsc
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Organizator</p>
                <p className="text-sm font-semibold">
                  {organization?.name || "Brak organizatora"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Format</p>
                <p className="text-sm font-semibold">Pojedyncza eliminacja</p>
                <p className="text-xs text-muted-foreground">
                  {Math.log2(tournament.teamLimit)} rund
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
