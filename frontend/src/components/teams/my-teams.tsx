import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/lib/providers/auth-provider";
import { useTeamControllerTeams } from "@/lib/api/teams/teams";
import { TeamCard } from "./team-card";

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
        return <TeamCard key={team.id} team={team} isOwner={isOwner} />;
      })}
    </div>
  );
}

function MyTeamsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2].map((i) => (
        <Card key={i} className="bg-card border-border">
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
