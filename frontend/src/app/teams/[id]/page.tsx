"use client";

import { useTeamControllerTeam } from "@/lib/api/teams/teams";
import { useCurrentUser } from "@/lib/providers/auth-provider";
import {
  TeamDetailsHeader,
  TeamDetailsHeaderSkeleton,
} from "@/components/teams/team-details-header";
import {
  TeamInfoStats,
  TeamInfoStatsSkeleton,
} from "@/components/teams/team-info-stats";
import {
  TeamMatchHistory,
  TeamMatchHistorySkeleton,
} from "@/components/teams/team-match-history";
import {
  TeamMembers,
  TeamMembersSkeleton,
} from "@/components/teams/team-members";

export default function TeamDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const teamId = Number.parseInt(params.id);
  const { user } = useCurrentUser();

  const { data: teamResponse, isLoading } = useTeamControllerTeam(teamId);
  const team = teamResponse?.data;

  const isOwner = team?.ownerId === user?.playerAccount?.id;
  const isMember =
    team?.members.some((member) => member.id === user?.playerAccount?.id) ??
    false;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <main className="container mx-auto px-4 py-6">
          <TeamDetailsHeaderSkeleton />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TeamInfoStatsSkeleton />
            <TeamMatchHistorySkeleton />
            <TeamMembersSkeleton />
          </div>
        </main>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <main className="container mx-auto px-4 py-6">
          <div className="bg-card border-border rounded-lg p-6 text-center">
            <p className="text-muted-foreground">Nie znaleziono drużyny</p>
          </div>
        </main>
      </div>
    );
  }

  // TODO: Replace with actual match history API
  const mockMatches = [
    {
      id: 1,
      result: "win" as const,
      opponent: "Elite Squad",
      score: "2-1",
      duration: "45:32",
      ratingChange: "+28",
      timestamp: "2h ago",
    },
    {
      id: 2,
      result: "win" as const,
      opponent: "Campus Kings",
      score: "2-0",
      duration: "38:15",
      ratingChange: "+25",
      timestamp: "1d ago",
    },
    {
      id: 3,
      result: "loss" as const,
      opponent: "Student Legends",
      score: "1-2",
      duration: "52:18",
      ratingChange: "-18",
      timestamp: "2d ago",
    },
    {
      id: 4,
      result: "win" as const,
      opponent: "Pro Academy",
      score: "2-1",
      duration: "41:22",
      ratingChange: "+22",
      timestamp: "3d ago",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <main className="container mx-auto px-4 py-6">
        <TeamDetailsHeader team={team} isOwner={isOwner} isMember={isMember} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TeamInfoStats team={team} />
          <TeamMatchHistory matches={mockMatches} />
          <TeamMembers team={team} isOwner={isOwner} />
        </div>
      </main>
    </div>
  );
}
