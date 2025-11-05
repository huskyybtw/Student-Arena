"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Mail, X, Check } from "lucide-react";
import { toast } from "sonner";
import {
  useTeamInvitationsControllerGetTeamInvitations,
  useTeamInvitationsControllerCreateInvitation,
  useTeamInvitationsControllerUpdateInvitation,
  getTeamInvitationsControllerGetTeamInvitationsQueryKey,
} from "@/lib/api/teams-invitations/teams-invitations";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { getTeamControllerTeamQueryKey } from "@/lib/api/teams/teams";
import { TeamInvitationResponseDtoStatus } from "@/lib/api/model";

interface TeamInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: number;
}

export function TeamInviteDialog({
  open,
  onOpenChange,
  teamId,
}: TeamInviteDialogProps) {
  const [playerId, setPlayerId] = useState("");
  const queryClient = useQueryClient();

  // Fetch all invitations for this team
  const { data: invitationsResponse, isLoading } =
    useTeamInvitationsControllerGetTeamInvitations(teamId, {
      query: {
        enabled: open, // Only fetch when dialog is open
      },
    });

  const invitations = invitationsResponse?.data || [];

  // Separate invitations by status
  const requestedInvitations = invitations.filter(
    (inv) => inv.status === TeamInvitationResponseDtoStatus.REQUESTED
  );
  const pendingInvitations = invitations.filter(
    (inv) => inv.status === TeamInvitationResponseDtoStatus.PENDING
  );

  // Create invitation mutation
  const createInvitationMutation = useTeamInvitationsControllerCreateInvitation(
    {
      mutation: {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey:
              getTeamInvitationsControllerGetTeamInvitationsQueryKey(teamId),
          });
          toast.success("Zaproszenie zostało wysłane");
          setPlayerId("");
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              "Błąd podczas wysyłania zaproszenia"
          );
        },
      },
    }
  );

  // Update invitation mutation (accept/reject)
  const updateInvitationMutation = useTeamInvitationsControllerUpdateInvitation(
    {
      mutation: {
        onSuccess: (response, variables) => {
          queryClient.invalidateQueries({
            queryKey:
              getTeamInvitationsControllerGetTeamInvitationsQueryKey(teamId),
          });
          queryClient.invalidateQueries({
            queryKey: getTeamControllerTeamQueryKey(teamId),
          });
          toast.success("Zaproszenie zostało zaktualizowane");
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              "Błąd podczas aktualizacji zaproszenia"
          );
        },
      },
    }
  );

  const handleInvite = () => {
    if (!playerId.trim()) {
      toast.error("Wprowadź ID gracza");
      return;
    }

    const playerIdNum = Number.parseInt(playerId);
    if (Number.isNaN(playerIdNum)) {
      toast.error("ID gracza musi być liczbą");
      return;
    }

    createInvitationMutation.mutate({
      teamId,
      id: playerIdNum,
    });
  };

  const handleAcceptInvitation = (playerId: number) => {
    updateInvitationMutation.mutate({
      teamId,
      id: playerId,
    });
  };

  const handleRejectInvitation = (playerId: number) => {
    updateInvitationMutation.mutate({
      teamId,
      id: playerId,
    });
  };

  const handleRevokeInvitation = (playerId: number) => {
    updateInvitationMutation.mutate({
      teamId,
      id: playerId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[80vw] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Zaproszenia do Drużyny</DialogTitle>
          <DialogDescription>
            Zaproś nowych graczy i zarządzaj zaproszeniami
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 border-b">
          <h3 className="font-semibold">Zaproś Gracza</h3>
          <div className="space-y-2">
            <Label htmlFor="invite-player-id">ID gracza</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="invite-player-id"
                  placeholder="Wprowadź ID gracza"
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  className="pl-10 h-11"
                  type="number"
                  disabled={createInvitationMutation.isPending}
                />
              </div>
              <Button
                variant="default"
                onClick={handleInvite}
                disabled={createInvitationMutation.isPending}
              >
                {createInvitationMutation.isPending ? "Wysyłanie..." : "Wyślij"}
              </Button>
            </div>
          </div>
        </div>

        {requestedInvitations.length > 0 && (
          <div className="space-y-3 py-4 border-b">
            <h3 className="font-semibold">Prośby o Dołączenie</h3>
            <div className="space-y-2">
              {requestedInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50"
                >
                  <div className="flex-1">
                    <p className="font-medium">
                      {invitation.player.gameName}#{invitation.player.tagLine}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(
                        new Date(invitation.createdAt),
                        "dd.MM.yyyy HH:mm"
                      )}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                      onClick={() =>
                        handleAcceptInvitation(invitation.playerId)
                      }
                      disabled={updateInvitationMutation.isPending}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      onClick={() =>
                        handleRejectInvitation(invitation.playerId)
                      }
                      disabled={updateInvitationMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {pendingInvitations.length > 0 && (
          <div className="space-y-3 py-4">
            <h3 className="font-semibold">Wysłane Zaproszenia</h3>
            <div className="space-y-2">
              {pendingInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50"
                >
                  <div className="flex-1">
                    <p className="font-medium">
                      {invitation.player.gameName}#{invitation.player.tagLine}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(
                        new Date(invitation.createdAt),
                        "dd.MM.yyyy HH:mm"
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Oczekuje</Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      onClick={() =>
                        handleRevokeInvitation(invitation.playerId)
                      }
                      disabled={updateInvitationMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading &&
          requestedInvitations.length === 0 &&
          pendingInvitations.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              Brak zaproszeń
            </div>
          )}
      </DialogContent>
    </Dialog>
  );
}
