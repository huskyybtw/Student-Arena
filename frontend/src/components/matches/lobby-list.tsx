import { Skeleton } from "@/components/ui/skeleton";
import { LobbyCard } from "./lobby-card";
import type { LobbyResponseDto } from "@/lib/api/model";

interface LobbyListProps {
  lobbies: LobbyResponseDto[];
  isLoading: boolean;
}

export function LobbyList({ lobbies, isLoading }: LobbyListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (lobbies.length === 0) {
    return (
      <div className="border border-border rounded-lg">
        <div className="px-4 py-8 text-center text-muted-foreground">
          Brak gier spełniających kryteria wyszukiwania
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 border border-border rounded-lg divide-y">
      {lobbies.map((lobby) => (
        <LobbyCard key={lobby.id} lobby={lobby} />
      ))}
    </div>
  );
}
