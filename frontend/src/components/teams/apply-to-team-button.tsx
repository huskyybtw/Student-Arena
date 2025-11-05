"use client";

import { Button } from "@/components/ui/button";
import { useTeamInvitationsControllerRequestInvitation } from "@/lib/api/teams-invitations/teams-invitations";
import { useCurrentUser } from "@/lib/providers/auth-provider";
import { toast } from "sonner";

interface ApplyToTeamButtonProps {
  teamId: number;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

export function ApplyToTeamButton({
  teamId,
  variant = "default",
  size = "sm",
  className = "",
  children,
}: ApplyToTeamButtonProps) {
  const { user } = useCurrentUser();

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

  const handleApply = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!user?.playerAccount?.id) {
      toast.error("Musisz być zalogowany");
      return;
    }

    requestInvitationMutation.mutate({
      teamId,
      id: user.playerAccount.id,
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleApply}
      disabled={requestInvitationMutation.isPending}
    >
      {requestInvitationMutation.isPending
        ? "Wysyłanie..."
        : children || "Aplikuj"}
    </Button>
  );
}
