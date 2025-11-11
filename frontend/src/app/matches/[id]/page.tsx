"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Check, X, Play } from "lucide-react";
import {
  useLobbyControllerFindOne,
  useLobbyControllerStart,
  getLobbyControllerFindOneQueryKey,
  getLobbyControllerFindAllQueryKey,
} from "@/lib/api/lobby/lobby";
import { useCurrentUser } from "@/lib/providers/auth-provider";
import { LobbyResponseDtoStatus } from "@/lib/api/model/lobbyResponseDtoStatus";
import { LobbyResponseDtoMatchType } from "@/lib/api/model/lobbyResponseDtoMatchType";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  LobbyTeams,
  LobbyTeamsSkeleton,
} from "@/components/matches/lobby-teams";
import {
  LobbyHeader,
  LobbyHeaderSkeleton,
} from "@/components/matches/lobby-header";
import { LobbyInfo, LobbyInfoSkeleton } from "@/components/matches/lobby-info";

function MatchDetailsPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <LobbyHeaderSkeleton />

          <Skeleton className="h-16 w-full rounded-lg" />

          <LobbyInfoSkeleton />

          <LobbyTeamsSkeleton />

          <div className="flex gap-3">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <Skeleton className="h-12 w-12 rounded-lg" />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function MatchDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [userReady, setUserReady] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const { user } = useCurrentUser();
  const router = useRouter();
  const queryClient = useQueryClient();

  const lobbyId = Number.parseInt(params.id);
  const { data: lobbyData, isLoading } = useLobbyControllerFindOne(lobbyId);

  const startMatchMutation = useLobbyControllerStart({
    mutation: {
      onSuccess: () => {
        toast.success("Mecz został rozpoczęty!");
        queryClient.invalidateQueries({
          queryKey: getLobbyControllerFindOneQueryKey(lobbyId),
        });
        queryClient.invalidateQueries({
          queryKey: getLobbyControllerFindAllQueryKey(),
        });
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Błąd podczas rozpoczynania meczu"
        );
      },
    },
  });

  const lobby = lobbyData?.data;
  const isOwner = user?.playerAccount?.id === lobby?.owner?.id;
  const isUserInLobby = lobby?.players?.some(
    (p) => p.player?.id === user?.playerAccount?.id
  );

  // Check if match date has passed
  const canStartMatch = isOwner && lobby && new Date(lobby.date) <= new Date();

  // Auto-refresh when match start time is reached
  useEffect(() => {
    if (!lobby) return;

    const matchDate = new Date(lobby.date);
    const now = new Date();

    if (matchDate > now) {
      const timeUntilMatch = matchDate.getTime() - now.getTime();

      if (timeUntilMatch < 24 * 60 * 60 * 1000) {
        const timeoutId = setTimeout(() => {
          queryClient.invalidateQueries({
            queryKey: getLobbyControllerFindOneQueryKey(lobbyId),
          });
        }, timeUntilMatch);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [lobby, lobbyId, queryClient]);

  if (isLoading || !lobby) {
    return <MatchDetailsPageSkeleton />;
  }

  const handleLeaveLobby = () => {
    // TODO: Implement leave lobby mutation when backend endpoint is ready
    // For now, show success message and redirect to matches page
    toast.success("Opuściłeś lobby");
    setLeaveDialogOpen(false);

    // Redirect to matches list after short delay
    setTimeout(() => {
      router.push("/matches");
    }, 500);
  };

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <LobbyHeader lobby={lobby} />

          {/* Header with title and description */}
          <div>
            <p className="text-muted-foreground">{lobby.description}</p>
          </div>

          <LobbyInfo lobby={lobby} isOwner={isOwner} />

          <LobbyTeams lobby={lobby} />

          <div className="flex gap-3 flex-wrap">
            {lobby.status === LobbyResponseDtoStatus.SCHEDULED && (
              <>
                {isUserInLobby ? (
                  <>
                    <Button
                      size="lg"
                      onClick={() => setUserReady(!userReady)}
                      variant={userReady ? "default" : "outline"}
                      className="h-12 w-12 p-0"
                      title={userReady ? "Gotowy" : "Oznacz jako gotowy"}
                    >
                      <Check className="h-5 w-5" />
                    </Button>
                    <Button
                      size="lg"
                      variant="destructive"
                      className="h-12 w-12 p-0"
                      title="Opuść grę"
                      onClick={() => setLeaveDialogOpen(true)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </>
                ) : (
                  <Button
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 px-8 py-6 text-base"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    {lobby.matchType === LobbyResponseDtoMatchType.Team
                      ? "Dołącz jako drużyna"
                      : "Dołącz do gry"}
                  </Button>
                )}
              </>
            )}
            {lobby.status === LobbyResponseDtoStatus.ONGOING && (
              <Button
                size="lg"
                variant="destructive"
                className="h-12 w-12 p-0"
                title="Opuść grę"
                onClick={() => setLeaveDialogOpen(true)}
              >
                <X className="h-5 w-5" />
              </Button>
            )}

            {/* Start Match Button - Always visible, enabled only for owner when date passed */}
            {lobby.status === LobbyResponseDtoStatus.SCHEDULED && (
              <Button
                size="lg"
                onClick={() => startMatchMutation.mutate({ id: lobbyId })}
                disabled={!canStartMatch || startMatchMutation.isPending}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed px-6"
                title={
                  !isOwner
                    ? "Tylko właściciel może rozpocząć mecz"
                    : !canStartMatch
                    ? "Mecz można rozpocząć dopiero po zaplanowanej dacie"
                    : "Rozpocznij mecz"
                }
              >
                <Play className="h-5 w-5 mr-2" />
                {startMatchMutation.isPending
                  ? "Rozpoczynanie..."
                  : "Rozpocznij mecz"}
              </Button>
            )}
          </div>

          <ConfirmationDialog
            open={leaveDialogOpen}
            onOpenChange={setLeaveDialogOpen}
            title="Opuścić grę?"
            description="Czy na pewno chcesz opuścić tę grę? Ta akcja nie może być cofnięta."
            onConfirm={handleLeaveLobby}
            confirmText="Opuść"
            cancelText="Anuluj"
            variant="destructive"
          />
        </div>
      </main>
    </div>
  );
}
