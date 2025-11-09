"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useLobbyControllerFindAll } from "@/lib/api/lobby/lobby";
import type { LobbyControllerFindAllParams } from "@/lib/api/model";

export default function MatchmakingPage() {
  const [rankedFilter, setRankedFilter] = useState(false);
  const [matchTypeFilter, setMatchTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeframeFilter, setTimeframeFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Build query params
  const queryParams: LobbyControllerFindAllParams = {
    page: 1,
    limit: 50,
  };

  // Fetch lobbies using Orval hook
  const { data, isLoading } = useLobbyControllerFindAll(queryParams);

  // Backend returns array directly, axios wraps it in data
  const lobbies = Array.isArray(data?.data) ? data.data : [];

  // Client-side filtering
  const filteredLobbies = lobbies.filter((lobby) => {
    const matchesRanked = !rankedFilter || lobby.ranked;
    const matchesType =
      matchTypeFilter === "all" || lobby.matchType === matchTypeFilter;
    const matchesStatus =
      statusFilter === "all" || lobby.status === statusFilter;

    let matchesTimeframe = true;
    if (startDate || endDate) {
      const lobbyDate = new Date(lobby.date);
      if (startDate && new Date(startDate) > lobbyDate)
        matchesTimeframe = false;
      if (endDate && new Date(endDate) < lobbyDate) matchesTimeframe = false;
    } else if (timeframeFilter !== "all") {
      const now = new Date();
      const lobbyDate = new Date(lobby.date);
      const diffMs = lobbyDate.getTime() - now.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (timeframeFilter === "15" && diffMins > 15) matchesTimeframe = false;
      if (timeframeFilter === "30" && diffMins > 30) matchesTimeframe = false;
      if (timeframeFilter === "60" && diffMins > 60) matchesTimeframe = false;
    }

    return matchesRanked && matchesType && matchesStatus && matchesTimeframe;
  });

  const userLobbies = filteredLobbies.filter(
    (lobby) => lobby.status === "ONGOING"
  );

  const getTimeUntilMatch = (date: Date | string) => {
    const now = new Date();
    const matchDate = new Date(date);
    const diffMs = matchDate.getTime() - now.getTime();
    if (diffMs < 0) return "Trwa";
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `za ${diffMins} minut`;
    const diffHours = Math.floor(diffMins / 60);
    return `za ${diffHours} godzin`;
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl font-bold mb-6">Gry Dobierane</h1>

            <div className="space-y-4 mb-6">
              <p className="text-sm text-muted-foreground">
                Filtruj gry po typie (Dobierane/Zespołowe), statusie
                (Zaplanowana/W trakcie), czaszie rozgrywki oraz rankingu
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <Select
                  value={matchTypeFilter}
                  onValueChange={setMatchTypeFilter}
                >
                  <SelectTrigger className="w-40 h-9">
                    <SelectValue placeholder="Typ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszystkie typy</SelectItem>
                    <SelectItem value="Queue">Dobierane</SelectItem>
                    <SelectItem value="Team">Zespołowe</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 h-9">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszystkie statusy</SelectItem>
                    <SelectItem value="SCHEDULED">Zaplanowane</SelectItem>
                    <SelectItem value="ONGOING">W trakcie</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2 items-center">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground"
                  />
                  <span className="text-muted-foreground">-</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground"
                  />
                </div>

                <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-md h-9">
                  <Checkbox
                    id="ranked"
                    checked={rankedFilter}
                    onCheckedChange={(checked) =>
                      setRankedFilter(checked === true)
                    }
                  />
                  <label
                    htmlFor="ranked"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Tylko Ranked
                  </label>
                </div>
              </div>
            </div>

            {userLobbies.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Twoje gry</h2>
                <div className="space-y-3 border border-border rounded-lg divide-y">
                  {userLobbies.map((lobby) => (
                    <Link key={lobby.id} href={`/matches/${lobby.id}`}>
                      <div className="px-4 py-4 hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-foreground truncate">
                                {lobby.title}
                              </h3>
                              <div className="flex gap-1 flex-shrink-0">
                                {lobby.ranked && (
                                  <Badge variant="default" className="text-xs">
                                    Ranked
                                  </Badge>
                                )}
                                <Badge
                                  variant={
                                    lobby.matchType === "Team"
                                      ? "secondary"
                                      : "outline"
                                  }
                                  className="text-xs"
                                >
                                  {lobby.matchType === "Team"
                                    ? "Zespołowe"
                                    : "Dobierane"}
                                </Badge>
                              </div>
                            </div>
                            {lobby.description && (
                              <p className="text-sm text-muted-foreground">
                                {lobby.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{getTimeUntilMatch(lobby.date)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <h2 className="text-lg font-semibold mb-4">Dostępne gry</h2>

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            )}

            {/* Lobbies List */}
            {!isLoading && (
              <div className="space-y-3 border border-border rounded-lg divide-y">
                {filteredLobbies.length > 0 ? (
                  filteredLobbies.map((lobby) => (
                    <Link key={lobby.id} href={`/matches/${lobby.id}`}>
                      <div className="px-4 py-4 hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-foreground truncate">
                                {lobby.title}
                              </h3>
                              <div className="flex gap-1 flex-shrink-0">
                                {lobby.ranked && (
                                  <Badge variant="default" className="text-xs">
                                    Ranked
                                  </Badge>
                                )}
                                <Badge
                                  variant={
                                    lobby.matchType === "Team"
                                      ? "secondary"
                                      : "outline"
                                  }
                                  className="text-xs"
                                >
                                  {lobby.matchType === "Team"
                                    ? "Zespołowe"
                                    : "Dobierane"}
                                </Badge>
                              </div>
                            </div>
                            {lobby.description && (
                              <p className="text-sm text-muted-foreground">
                                {lobby.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{getTimeUntilMatch(lobby.date)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-muted-foreground">
                    Brak gier spełniających kryteria wyszukiwania
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
