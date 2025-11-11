import { Users, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LobbyResponseDto } from "@/lib/api/model/lobbyResponseDto";
import { LobbyResponseDtoMatchType } from "@/lib/api/model/lobbyResponseDtoMatchType";
import { LobbyResponseDtoStatus } from "@/lib/api/model/lobbyResponseDtoStatus";
import { EditLobbyDialog } from "@/components/matches/edit-lobby-dialog";

interface LobbyInfoProps {
  lobby: LobbyResponseDto;
  isOwner: boolean;
}

export function LobbyInfoSkeleton() {
  return (
    <div className="flex items-center justify-between gap-6 flex-wrap">
      <div className="flex items-center gap-6 flex-wrap">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-28" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  );
}

export function LobbyInfo({ lobby, isOwner }: LobbyInfoProps) {
  const getTimeUntilMatch = (date: Date | string) => {
    const matchDate = new Date(date);
    const now = new Date();
    const diffMs = matchDate.getTime() - now.getTime();
    if (diffMs < 0) return "Trwa teraz";
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `za ${diffMins} minut`;
    const diffHours = Math.floor(diffMins / 60);
    return `za ${diffHours} godzin`;
  };

  return (
    <div className="flex items-center justify-between gap-6 flex-wrap">
      <div className="flex items-center gap-6 flex-wrap text-sm">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">
            {lobby.players?.length || 0}/10 graczy
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{getTimeUntilMatch(lobby.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs font-medium">
            {lobby.matchType === LobbyResponseDtoMatchType.Team
              ? "Zespołowe"
              : "Dobierane"}
          </span>
        </div>
      </div>
      {isOwner && lobby.status === LobbyResponseDtoStatus.SCHEDULED && (
        <EditLobbyDialog
          lobbyId={lobby.id}
          initialTitle={lobby.title}
          initialDescription={lobby.description}
          initialRanked={lobby.ranked}
          initialDate={new Date(lobby.date)}
        />
      )}
    </div>
  );
}
