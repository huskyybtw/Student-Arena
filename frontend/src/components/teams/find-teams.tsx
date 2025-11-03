import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter } from "lucide-react";
import { useTeamControllerTeams } from "@/lib/api/teams/teams";
import { SearchBar } from "@/components/ui/search-bar";
import { TeamCard } from "./team-card";

export function FindTeams() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: availableTeamsData, isLoading } = useTeamControllerTeams(
    searchTerm ? { search: searchTerm } : undefined
  );

  const teams = availableTeamsData?.data || [];

  if (isLoading) {
    return <FindTeamsLoadingSkeleton />;
  }

  return (
    <div className="space-y-4">
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Szukaj drużyny po nazwie lub tagu..."
              icon={<Search className="h-4 w-4" />}
              className="flex-1"
              debounce={300}
            />
            <Button variant="secondary" size="default" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtry
            </Button>
          </div>
        </CardContent>
      </Card>

      {teams.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? "Nie znaleziono drużyn" : "Brak dostępnych drużyn"}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              showRecruitingBadge
              variant="list"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FindTeamsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4 flex-1">
                <Skeleton className="w-14 h-14 rounded-lg" />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                  <div className="flex items-center gap-6">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
