'use client';

import { useParams } from 'next/navigation';
import { TournamentDetails } from '@/components/tournaments/tournament-details';
import { TournamentBracket } from '@/components/tournaments/tournament-bracket';
import { TournamentTeams } from '@/components/tournaments/tournament-teams';
import { Skeleton } from '@/components/ui/skeleton';

function TournamentDetailsPageSkeleton() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function TournamentDetailsPage() {
  const params = useParams();
  const tournamentId = Number(params.id);

  if (!tournamentId) {
    return <TournamentDetailsPageSkeleton />;
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        <TournamentDetails tournamentId={tournamentId} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <TournamentTeams tournamentId={tournamentId} />
          </div>
          <div className="lg:col-span-2">
            <TournamentBracket tournamentId={tournamentId} />
          </div>
        </div>
      </div>
    </main>
  );
}
