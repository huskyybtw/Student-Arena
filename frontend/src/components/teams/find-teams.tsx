import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users, Filter } from "lucide-react";
import Link from "next/link";
import { TeamResponseDto } from "@/lib/api/model";
import { useTeamControllerTeams } from "@/lib/api/teams/teams";
import { SearchBar } from "@/components/ui/search-bar";

export function FindTeams() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: availableTeamsData, isLoading } = useTeamControllerTeams(
    searchTerm
      ? {
          search: searchTerm,
        }
      : undefined
  );

  const teams = availableTeamsData?.data || [];

  return (
    <div className="space-y-4">
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
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
            <Button variant="outline" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Filtry
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="bg-card/80 backdrop-blur-sm border-border/50"
            >
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
      ) : teams.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? "Nie znaleziono drużyn" : "Brak dostępnych drużyn"}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {teams.map((team) => {
            const hasOpenSlots = team.members.length < 5;

            return (
              <Card
                key={team.id}
                className="bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                        <Users className="h-7 w-7 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{team.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            [{team.tag}]
                          </Badge>
                          {hasOpenSlots && (
                            <Badge variant="secondary" className="text-xs">
                              Rekrutuje
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Rating:{" "}
                            </span>
                            <span className="font-semibold">{team.rating}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Członkowie:{" "}
                            </span>
                            <span className="font-semibold">
                              {team.members.length}/5
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/teams/${team.id}`}>
                        <Button variant="outline" size="sm">
                          Zobacz
                        </Button>
                      </Link>
                      {hasOpenSlots && <Button size="sm">Aplikuj</Button>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
