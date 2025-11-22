import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Crown, UserMinus } from "lucide-react";
import { useRouter } from "next/navigation";

interface TournamentTeamsProps {
  tournamentId: number;
  isOrganizer?: boolean;
}

// Mock data
const mockTeams = [
  {
    id: 1,
    name: "Team Alpha",
    tag: "ALPHA",
    rating: 1850,
    members: [
      { id: 1, username: "Player1" },
      { id: 2, username: "Player2" },
      { id: 3, username: "Player3" },
      { id: 4, username: "Player4" },
      { id: 5, username: "Player5" },
    ],
  },
  {
    id: 2,
    name: "Team Beta",
    tag: "BETA",
    rating: 1720,
    members: [
      { id: 6, username: "Player6" },
      { id: 7, username: "Player7" },
      { id: 8, username: "Player8" },
      { id: 9, username: "Player9" },
      { id: 10, username: "Player10" },
    ],
  },
];

export function TournamentTeams({
  tournamentId,
  isOrganizer,
}: TournamentTeamsProps) {
  const router = useRouter();

  // TODO: Replace with actual API call
  const isLoading = false;
  const teams = mockTeams;

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Zarejestrowane drużyny
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="flex items-center justify-between p-3">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Zarejestrowane drużyny ({teams.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {teams.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Żadna drużyna nie zapisała się jeszcze do turnieju</p>
          </div>
        ) : (
          <div className="space-y-2 border border-border rounded-lg divide-y">
            {teams.map((team, index) => (
              <div
                key={team.id}
                className="px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => router.push(`/teams/${team.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {team.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          [{team.tag}]
                        </span>
                        {index === 0 && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          Rating: {team.rating}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">
                          {team.members.length} członków
                        </span>
                      </div>
                    </div>
                  </div>

                  {isOrganizer && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implement remove team logic
                      }}
                    >
                      <UserMinus className="h-4 w-4" />
                      Usuń
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
