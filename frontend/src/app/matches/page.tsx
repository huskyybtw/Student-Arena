"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DatePicker } from "@/components/ui/date-range-picker";
import { useLobbyControllerFindAll } from "@/lib/api/lobby/lobby";
import type { LobbyControllerFindAllParams } from "@/lib/api/model";
import { LobbyFiltersStatus } from "@/lib/api/model/lobbyFiltersStatus";
import { LobbyFiltersMatchType } from "@/lib/api/model/lobbyFiltersMatchType";
import {
  LobbyListItem,
  LobbyListItemSkeleton,
} from "@/components/matches/lobby-list-item";
import { CreateLobbyDialog } from "@/components/matches/create-lobby-dialog";
import { Filter, X } from "lucide-react";

function MatchmakingPageSkeleton() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-96" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-5 w-full max-w-2xl" />
          <div className="flex items-center gap-3 flex-wrap">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 w-[200px]" />
            <Skeleton className="h-9 w-[200px]" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-2 border border-border rounded-lg divide-y">
            {[...Array(5)].map((_, i) => (
              <LobbyListItemSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function MatchmakingPage() {
  const [rankedFilter, setRankedFilter] = useState(false);
  const [matchTypeFilter, setMatchTypeFilter] = useState<
    LobbyFiltersMatchType | undefined
  >(undefined);
  const [statusFilter, setStatusFilter] = useState<
    LobbyFiltersStatus | undefined
  >(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const queryParams: LobbyControllerFindAllParams = {
    page: 1,
    limit: 50,
    ranked: rankedFilter ? true : undefined,
    matchType: matchTypeFilter,
    status: statusFilter,
    dateFrom: startDate?.toISOString(),
    dateTo: endDate?.toISOString(),
  };

  const { data, isLoading } = useLobbyControllerFindAll(queryParams);
  const lobbies = Array.isArray(data?.data) ? data.data : [];
  const userLobbies = lobbies.filter(
    (lobby) => lobby.status === LobbyFiltersStatus.ONGOING
  );

  if (isLoading) {
    return <MatchmakingPageSkeleton />;
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        {/* Page header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Gry Dobierane</h1>
          <p className="text-muted-foreground">
            Dołącz do gier dobieranych lub stwórz własne lobby zespołowe
          </p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-3">
              Filtruj gry po typie, statusie, czasie rozgrywki oraz rankingu
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Select
                value={matchTypeFilter ?? "all"}
                onValueChange={(value) =>
                  setMatchTypeFilter(
                    value === "all"
                      ? undefined
                      : (value as LobbyFiltersMatchType)
                  )
                }
              >
                <SelectTrigger className="w-40 h-9">
                  <SelectValue placeholder="Typ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie typy</SelectItem>
                  <SelectItem value={LobbyFiltersMatchType.Queue}>
                    Dobierane
                  </SelectItem>
                  <SelectItem value={LobbyFiltersMatchType.Team}>
                    Zespołowe
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={statusFilter ?? "all"}
                onValueChange={(value) =>
                  setStatusFilter(
                    value === "all" ? undefined : (value as LobbyFiltersStatus)
                  )
                }
              >
                <SelectTrigger className="w-40 h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie statusy</SelectItem>
                  <SelectItem value={LobbyFiltersStatus.SCHEDULED}>
                    Zaplanowane
                  </SelectItem>
                  <SelectItem value={LobbyFiltersStatus.ONGOING}>
                    W trakcie
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2 items-center">
                <DatePicker
                  date={startDate}
                  onDateChange={setStartDate}
                  placeholder="Data od"
                />

                <span className="text-muted-foreground">-</span>

                <DatePicker
                  date={endDate}
                  onDateChange={setEndDate}
                  placeholder="Data do"
                />
              </div>

              <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-md h-9 bg-card/50">
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

              {(startDate ||
                endDate ||
                rankedFilter ||
                matchTypeFilter ||
                statusFilter) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStartDate(undefined);
                    setEndDate(undefined);
                    setRankedFilter(false);
                    setMatchTypeFilter(undefined);
                    setStatusFilter(undefined);
                  }}
                  className="h-9 gap-2"
                >
                  <X className="h-4 w-4" />
                  Wyczyść filtry
                </Button>
              )}
            </div>
          </div>

          <CreateLobbyDialog />
        </div>

        {userLobbies.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Twoje gry</h2>
            <div className="space-y-2 border border-border rounded-lg divide-y">
              {userLobbies.map((lobby) => (
                <LobbyListItem key={lobby.id} lobby={lobby} />
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold mb-4">Dostępne gry</h2>
          {lobbies.length > 0 ? (
            <div className="space-y-2 border border-border rounded-lg divide-y">
              {lobbies.map((lobby) => (
                <LobbyListItem key={lobby.id} lobby={lobby} />
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-muted-foreground border border-border rounded-lg">
              Brak gier spełniających kryteria wyszukiwania
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
