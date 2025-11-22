import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Crown } from "lucide-react";

interface TournamentBracketProps {
  tournamentId: number;
}

// Temporary mock data
const mockMatches = [
  {
    id: 1,
    round: 1,
    position: 1,
    team1: { name: "Team Alpha", tag: "ALPHA" },
    team2: { name: "Team Beta", tag: "BETA" },
    winner: null,
  },
  {
    id: 2,
    round: 1,
    position: 2,
    team1: { name: "Team Gamma", tag: "GAMMA" },
    team2: { name: "Team Delta", tag: "DELTA" },
    winner: null,
  },
  {
    id: 3,
    round: 1,
    position: 3,
    team1: null,
    team2: null,
    winner: null,
  },
  {
    id: 4,
    round: 1,
    position: 4,
    team1: null,
    team2: null,
    winner: null,
  },
];

export function TournamentBracket({ tournamentId }: TournamentBracketProps) {
  // TODO: Replace with actual API call
  const isLoading = false;
  const matches = mockMatches;

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Drabinka turniejowa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group matches by round
  const rounds = matches.reduce((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = [];
    }
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, typeof matches>);

  const roundNumbers = Object.keys(rounds)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Drabinka turniejowa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="flex gap-8 min-w-max pb-4">
            {roundNumbers.map((roundNum) => (
              <div key={roundNum} className="flex-1 min-w-[300px]">
                <div className="mb-4">
                  <Badge variant="secondary">
                    {roundNum === Math.max(...roundNumbers)
                      ? "Finał"
                      : roundNum === Math.max(...roundNumbers) - 1
                      ? "Półfinał"
                      : `Runda ${roundNum}`}
                  </Badge>
                </div>

                <div className="space-y-4">
                  {rounds[roundNum].map((match) => (
                    <Card
                      key={match.id}
                      className="bg-muted/30 border-border hover:border-primary/50 transition-colors"
                    >
                      <CardContent className="p-4 space-y-2">
                        <div
                          className={`flex items-center justify-between p-3 rounded-md ${
                            match.winner === 1
                              ? "bg-primary/20 border border-primary"
                              : "bg-card/50"
                          }`}
                        >
                          {match.team1 ? (
                            <div className="flex items-center gap-2">
                              {match.winner === 1 && (
                                <Crown className="h-4 w-4 text-primary" />
                              )}
                              <span className="font-medium">
                                {match.team1.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                [{match.team1.tag}]
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">
                              Oczekiwanie na drużynę
                            </span>
                          )}
                        </div>

                        <div className="text-center text-xs text-muted-foreground font-semibold">
                          VS
                        </div>

                        <div
                          className={`flex items-center justify-between p-3 rounded-md ${
                            match.winner === 2
                              ? "bg-primary/20 border border-primary"
                              : "bg-card/50"
                          }`}
                        >
                          {match.team2 ? (
                            <div className="flex items-center gap-2">
                              {match.winner === 2 && (
                                <Crown className="h-4 w-4 text-primary" />
                              )}
                              <span className="font-medium">
                                {match.team2.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                [{match.team2.tag}]
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">
                              Oczekiwanie na drużynę
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {matches.every((m) => !m.team1 && !m.team2) && (
          <div className="text-center py-12 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Drabinka zostanie wygenerowana po zapisie wszystkich drużyn</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
