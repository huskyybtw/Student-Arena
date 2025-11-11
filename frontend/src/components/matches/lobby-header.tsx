import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LobbyResponseDto } from "@/lib/api/model/lobbyResponseDto";
import { LobbyResponseDtoStatus } from "@/lib/api/model/lobbyResponseDtoStatus";

interface LobbyHeaderProps {
  lobby: LobbyResponseDto;
}

export function LobbyHeaderSkeleton() {
  return (
    <div className="rounded-lg p-6 border bg-muted/20">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-64" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function LobbyHeader({ lobby }: LobbyHeaderProps) {
  const getBannerStyle = () => {
    switch (lobby.status) {
      case LobbyResponseDtoStatus.SCHEDULED:
        return "bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-blue-500/50 animate-pulse";
      case LobbyResponseDtoStatus.ONGOING:
        return "bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/50 animate-pulse";
      case LobbyResponseDtoStatus.COMPLETED:
        return "bg-gradient-to-r from-gray-600/20 to-slate-600/20 border-gray-500/50";
      default:
        return "";
    }
  };

  const getStatusInfo = () => {
    switch (lobby.status) {
      case LobbyResponseDtoStatus.SCHEDULED:
        return { text: "Zaplanowana", color: "bg-blue-600" };
      case LobbyResponseDtoStatus.ONGOING:
        return { text: "W trakcie", color: "bg-green-600" };
      case LobbyResponseDtoStatus.COMPLETED:
        return { text: "Ukończona", color: "bg-gray-600" };
      default:
        return { text: "", color: "" };
    }
  };

  return (
    <div
      className={`rounded-lg p-6 border transition-all duration-300 ${getBannerStyle()}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Status gry</p>
          <h2 className="text-3xl font-bold">{lobby.title}</h2>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge className={getStatusInfo().color}>
            {getStatusInfo().text}
          </Badge>
          {lobby.ranked && (
            <Badge variant="default" className="text-xs">
              Ranked
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
