"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PlayerResponseDto, TeamResponseDto } from "@/lib/api/model";
import { RankingRow } from "./ranking-row";

interface RatingsTableProps {
  type: "players" | "teams";
  data: PlayerResponseDto[] | TeamResponseDto[];
  isLoading: boolean;
  startRank: number;
}

export function RatingsTable({
  type,
  data,
  isLoading,
  startRank,
}: RatingsTableProps) {
  return (
    <Card className="bg-card border-border overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2.5 bg-muted/30 text-xs font-medium text-muted-foreground border-b border-border">
        <div className="col-span-1">Miejsce</div>
        <div className="col-span-3">
          {type === "players" ? "Gracz" : "Drużyna"}
        </div>
        <div className="col-span-3">
          {type === "players" ? "Role" : "Członkowie"}
        </div>
        <div className="col-span-2">Rating</div>
        <div className="col-span-3"></div>
      </div>

      {/* Table body */}
      <div className="divide-y divide-border">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="grid grid-cols-12 gap-4 px-4 py-3 items-center"
            >
              <div className="col-span-1">
                <Skeleton className="h-6 w-8" />
              </div>
              <div className="col-span-3">
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="col-span-3">
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="col-span-2">
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="col-span-3"></div>
            </div>
          ))
        ) : data.length > 0 ? (
          data.map((item, idx) => (
            <RankingRow
              key={type === "players" ? item.id : (item as TeamResponseDto).id}
              type={type === "players" ? "player" : "team"}
              data={item}
              rank={startRank + idx}
            />
          ))
        ) : (
          <div className="px-4 py-8 text-center text-muted-foreground text-sm">
            Brak wyników spełniających kryteria wyszukiwania
          </div>
        )}
      </div>
    </Card>
  );
}
