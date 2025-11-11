"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Crown, UserMinus } from "lucide-react";
import { TeamResponseDto } from "@/lib/api/model";
import { toast } from "sonner";
import { useTeamInvitationsControllerRemoveMember } from "@/lib/api/teams-invitations/teams-invitations";
import { useQueryClient } from "@tanstack/react-query";
import { getTeamControllerTeamQueryKey } from "@/lib/api/teams/teams";
import { RoleIcon } from "@/components/ui/role-icon";

interface TeamMembersProps {
  team: TeamResponseDto;
  isOwner: boolean;
}

export function TeamMembers({ team, isOwner }: TeamMembersProps) {
  const queryClient = useQueryClient();

  const removeMemberMutation = useTeamInvitationsControllerRemoveMember({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getTeamControllerTeamQueryKey(team.id),
        });
        toast.success("Członek został usunięty z drużyny");
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message ||
            "Błąd podczas usuwania członka z drużyny"
        );
      },
    },
  });

  const handleKickMember = (memberId: number) => {
    removeMemberMutation.mutate({
      teamId: team.id,
      id: memberId,
    });
  };

  return (
    <Card className="bg-card border-border lg:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Członkowie
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {team.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={`/generic-placeholder-icon.png?height=40&width=40`}
                  />
                  <AvatarFallback>{member.gameName?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">
                      {member.gameName}#{member.tagLine}
                    </p>
                    {member.id === team.ownerId && (
                      <Crown className="h-3 w-3 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {member.primaryRole && (
                      <div className="flex items-center gap-1">
                        <RoleIcon role={member.primaryRole} size={16} />
                        <span className="text-xs">{member.primaryRole}</span>
                      </div>
                    )}
                    {member.secondaryRole && (
                      <div className="flex items-center gap-1">
                        <RoleIcon role={member.secondaryRole} size={16} />
                        <span className="text-xs">{member.secondaryRole}</span>
                      </div>
                    )}
                    <span>{member.rating}</span>
                  </div>
                </div>
              </div>
              {isOwner && member.id !== team.ownerId && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive h-8 w-8"
                  onClick={() => handleKickMember(member.id)}
                  disabled={removeMemberMutation.isPending}
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TeamMembersSkeleton() {
  return (
    <Card className="bg-card border-border lg:col-span-2">
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
