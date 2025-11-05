"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserPlus, Settings } from "lucide-react";
import {
  TeamResponseDto,
  TeamInvitationResponseDtoStatus,
} from "@/lib/api/model";
import { TeamInviteDialog } from "./team-invite-dialog";
import { TeamEditDialog } from "./team-edit-dialog";
import {
  useTeamInvitationsControllerGetTeamInvitations,
  useTeamInvitationsControllerRequestInvitation,
} from "@/lib/api/teams-invitations/teams-invitations";
import { useCurrentUser } from "@/lib/providers/auth-provider";
import { toast } from "sonner";

interface TeamDetailsHeaderProps {
  team: TeamResponseDto;
  isOwner: boolean;
  isMember: boolean;
}

export function TeamDetailsHeader({
  team,
  isOwner,
  isMember,
}: TeamDetailsHeaderProps) {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { user } = useCurrentUser();

  // Fetch invitations count for the badge
  const { data: invitationsResponse } =
    useTeamInvitationsControllerGetTeamInvitations(team.id, {
      query: {
        enabled: isOwner, // Only fetch if user is owner
      },
    });

  const invitations = invitationsResponse?.data || [];
  const invitationsCount = invitations.filter(
    (inv) => inv.status === TeamInvitationResponseDtoStatus.REQUESTED
  ).length;

  const requestInvitationMutation =
    useTeamInvitationsControllerRequestInvitation({
      mutation: {
        onSuccess: () => {
          toast.success("Prośba o dołączenie została wysłana");
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || "Błąd podczas wysyłania prośby"
          );
        },
      },
    });

  const handleApply = () => {
    if (!user?.playerAccount?.id) {
      toast.error("Musisz być zalogowany");
      return;
    }
    requestInvitationMutation.mutate({
      teamId: team.id,
      id: user.playerAccount.id,
    });
  };

  return (
    <>
      <Card className="bg-card border-border mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                <Users className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{team.name}</h1>
                <p className="text-sm text-muted-foreground">[{team.tag}]</p>
              </div>
            </div>
            {isOwner && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => setIsInviteDialogOpen(true)}
                >
                  <UserPlus className="h-4 w-4" />
                  Zaproś
                  {invitationsCount > 0 && (
                    <span className="ml-1 bg-primary-foreground text-primary rounded-full px-2 py-0.5 text-xs font-bold">
                      {invitationsCount}
                    </span>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="gap-2"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Settings className="h-4 w-4" />
                  Edytuj
                </Button>
              </div>
            )}
            {!isMember && !isOwner && (
              <Button
                size="sm"
                className="gap-2"
                onClick={handleApply}
                disabled={requestInvitationMutation.isPending}
              >
                <UserPlus className="h-4 w-4" />
                {requestInvitationMutation.isPending
                  ? "Wysyłanie..."
                  : "Aplikuj"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <TeamInviteDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        teamId={team.id}
      />
      <TeamEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        team={team}
      />
    </>
  );
}

export function TeamDetailsHeaderSkeleton() {
  return (
    <Card className="bg-card border-border mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-14 h-14 rounded-lg" />
            <div>
              <Skeleton className="h-8 w-48 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
