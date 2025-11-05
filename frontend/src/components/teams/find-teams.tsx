import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Users } from "lucide-react";
import { useTeamControllerTeams } from "@/lib/api/teams/teams";
import { SearchBar } from "@/components/ui/search-bar";
import { useRouter } from "next/navigation";
import { ApplyToTeamButton } from "./apply-to-team-button";

export function FindTeams() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const { data: availableTeamsData, isLoading } = useTeamControllerTeams(
    searchTerm ? { search: searchTerm } : undefined
  );

  const teams = availableTeamsData?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
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

        {/* Loading skeletons */}
        <Card className="bg-card border-border overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-4 py-2.5 bg-muted/30 text-xs font-medium text-muted-foreground border-b border-border">
            <div className="col-span-4">Drużyna</div>
            <div className="col-span-3">Członkowie</div>
            <div className="col-span-2">Rating</div>
            <div className="col-span-3 text-center">Akcja</div>
          </div>
          <CardContent className="p-0 divide-y divide-border">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 gap-4 px-4 py-3 items-center"
              >
                <div className="col-span-4 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="col-span-3">
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="col-span-2">
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="col-span-3 flex items-center justify-center gap-2">
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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

      <div className="space-y-2 border border-border rounded-lg divide-y">
        <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-muted/50 text-sm font-medium text-muted-foreground">
          <div className="col-span-4">Drużyna</div>
          <div className="col-span-3">Członkowie</div>
          <div className="col-span-2">Rating</div>
          <div className="col-span-3 text-center">Akcja</div>
        </div>

        {teams.length > 0 ? (
          teams.map((team) => (
            <div
              key={team.id}
              className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-muted/30 transition-colors text-sm cursor-pointer"
              onClick={() => router.push(`/teams/${team.id}`)}
            >
              <div className="col-span-4">
                <p className="font-medium text-foreground">{team.name}</p>
                <p className="text-xs text-muted-foreground">[{team.tag}]</p>
              </div>
              <div className="col-span-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    {team.members?.length || 0} członków
                  </span>
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-foreground">
                  {team.rating}
                </p>
              </div>
              <div
                className="col-span-3 flex items-center justify-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <ApplyToTeamButton
                  teamId={team.id}
                  size="sm"
                  className="text-xs h-8"
                />
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-8 text-center text-muted-foreground">
            {searchTerm ? "Nie znaleziono drużyn" : "Brak dostępnych drużyn"}
          </div>
        )}
      </div>
    </div>
  );
}
