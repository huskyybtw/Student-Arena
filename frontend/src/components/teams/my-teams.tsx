import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Crown, Settings } from "lucide-react";
import Link from "next/link";
import { useCurrentUser } from "@/lib/providers/auth-provider";
import { useTeamControllerTeams } from "@/lib/api/teams/teams";

export function MyTeams() {
  const { user } = useCurrentUser();

  const { data: myTeamsData, isLoading } = useTeamControllerTeams(
    user?.id
      ? {
          ownerId: user.id,
        }
      : undefined,
    {
      query: {
        enabled: !!user?.id,
      },
    }
  );

  const teams = myTeamsData?.data || [];

  if (isLoading) {
    return <MyTeamsLoadingSkeleton />;
  }

  if (teams.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nie jesteś członkiem żadnej drużyny
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {teams.map((team) => {
        const isOwner = team.ownerId === user?.id;

        return (
          <Card
            key={team.id}
            className="bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{team.name}</h3>
                      {isOwner && <Crown className="h-4 w-4 text-yellow-500" />}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      [{team.tag}]
                    </p>
                  </div>
                </div>
                {isOwner && (
                  <Link href={`/teams/${team.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                    >
                      <Settings className="h-4 w-4" />
                      Zarządzaj
                    </Button>
                  </Link>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-muted-foreground">Rating</p>
                    <p className="font-semibold">{team.rating}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Członkowie</p>
                    <p className="font-semibold">{team.members.length}/5</p>
                  </div>
                </div>
                <Link href={`/teams/${team.id}`}>
                  <Button variant="ghost" size="sm">
                    Zobacz
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function MyTeamsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2].map((i) => (
        <Card key={i} className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div>
                  <Skeleton className="h-6 w-32 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div>
                  <Skeleton className="h-4 w-12 mb-1" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div>
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </div>
              <Skeleton className="h-9 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
