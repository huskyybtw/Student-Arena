"use client";

import { useRouter } from "next/navigation";
import { Crown, Users } from "lucide-react";
import { PlayerResponseDto, TeamResponseDto } from "@/lib/api/model";
import { Badge } from "@/components/ui/badge";

interface RankingRowProps {
  type: "player" | "team";
  data: PlayerResponseDto | TeamResponseDto;
  rank: number;
}

export function RankingRow({ type, data, rank }: RankingRowProps) {
  const router = useRouter();

  const getCrownColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-slate-400";
    if (rank === 3) return "text-orange-600";
    return "";
  };

  const getRankStyle = (rank: number) => {
    if (rank <= 3) return "text-lg font-bold";
    if (rank <= 10)
      return "text-base font-semibold text-blue-600 dark:text-blue-400";
    return "text-base text-muted-foreground";
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-600 dark:text-yellow-500";
    if (rank === 2) return "text-slate-500 dark:text-slate-400";
    if (rank === 3) return "text-orange-600 dark:text-orange-500";
    return "";
  };

  const handleClick = () => {
    if (type === "player") {
      const player = data as PlayerResponseDto;
      router.push(`/dashboard/${player.userId}`);
    } else {
      const team = data as TeamResponseDto;
      router.push(`/teams/${team.id}`);
    }
  };

  return (
    <div
      className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-muted/40 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      {/* Rank */}
      <div className="col-span-1 flex items-center justify-start gap-2">
        {rank <= 3 && <Crown className={`h-4 w-4 ${getCrownColor(rank)}`} />}
        <span className={`${getRankStyle(rank)} ${getRankColor(rank)}`}>
          {rank}
        </span>
      </div>

      {/* Name */}
      <div className="col-span-3">
        {type === "player" ? (
          <p className="font-medium text-foreground text-sm">
            {(data as PlayerResponseDto).gameName &&
            (data as PlayerResponseDto).tagLine
              ? `${(data as PlayerResponseDto).gameName}#${
                  (data as PlayerResponseDto).tagLine
                }`
              : "Nieznany gracz"}
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            <p className="font-medium text-foreground text-sm">
              {(data as TeamResponseDto).name}
            </p>
            <p className="text-xs text-muted-foreground">
              [{(data as TeamResponseDto).tag}]
            </p>
          </div>
        )}
      </div>

      {/* Roles or Members */}
      <div className="col-span-3">
        {type === "player" ? (
          <div className="flex flex-wrap gap-1">
            {(data as PlayerResponseDto).primaryRole && (
              <Badge variant="secondary" className="text-xs">
                {(data as PlayerResponseDto).primaryRole}
              </Badge>
            )}
            {(data as PlayerResponseDto).secondaryRole && (
              <Badge variant="secondary" className="text-xs">
                {(data as PlayerResponseDto).secondaryRole}
              </Badge>
            )}
            {!(data as PlayerResponseDto).primaryRole &&
              !(data as PlayerResponseDto).secondaryRole && (
                <span className="text-xs text-muted-foreground">Brak ról</span>
              )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">
              {(data as TeamResponseDto).members?.length || 0} członków
            </span>
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="col-span-2">
        <p className="text-sm font-medium text-foreground">{data.rating}</p>
      </div>

      {/* Empty column for alignment */}
      <div className="col-span-3"></div>
    </div>
  );
}
