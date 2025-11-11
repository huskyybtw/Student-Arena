import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "lucide-react";
import type { LobbyResponseDto } from "@/lib/api/model/lobbyResponseDto";

interface LobbyListItemProps {
  lobby: LobbyResponseDto;
}

export function LobbyListItemSkeleton() {
  return (
    <div className="px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  );
}

export function LobbyListItem({ lobby }: LobbyListItemProps) {
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
    <Link href={`/matches/${lobby.id}`}>
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
                  variant={lobby.matchType === "Team" ? "secondary" : "outline"}
                  className="text-xs"
                >
                  {lobby.matchType === "Team" ? "Zespołowe" : "Dobierane"}
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
  );
}
