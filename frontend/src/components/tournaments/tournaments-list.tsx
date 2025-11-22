import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Calendar, Users, Trophy } from 'lucide-react';
import { SearchBar } from '@/components/ui/search-bar';
import { useRouter } from 'next/navigation';
import { DatePicker } from '@/components/ui/date-range-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTournamentsControllerTournaments } from '@/lib/api/tournaments/tournaments';
import type { TournamentsControllerTournamentsParams } from '@/lib/api/model';

export function TournamentsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [teamLimitFilter, setTeamLimitFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const router = useRouter();

  const queryParams: TournamentsControllerTournamentsParams = {
    page: 1,
    limit: 50,
    teamLimit: teamLimitFilter !== 'all' ? Number(teamLimitFilter) : undefined,
    startsAtFrom: startDate?.toISOString(),
    startsAtTo: endDate?.toISOString(),
  };

  const { data, isLoading, error } = useTournamentsControllerTournaments(queryParams);
  const tournaments = Array.isArray(data?.data) ? data.data : [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3 flex-wrap">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Szukaj turnieju..."
            icon={<Search className="h-4 w-4" />}
            className="flex-1 min-w-[200px]"
            debounce={300}
          />

          <Select value={teamLimitFilter} onValueChange={setTeamLimitFilter}>
            <SelectTrigger className="w-40 h-9">
              <SelectValue placeholder="Liczba drużyn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              <SelectItem value="8">8 drużyn</SelectItem>
              <SelectItem value="16">16 drużyn</SelectItem>
              <SelectItem value="32">32 drużyny</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2 items-center">
            <DatePicker
              date={startDate}
              onDateChange={setStartDate}
              placeholder="Data od"
            />
            <span className="text-muted-foreground">-</span>
            <DatePicker
              date={endDate}
              onDateChange={setEndDate}
              placeholder="Data do"
            />
          </div>
        </div>

        <div className="space-y-2 border border-border rounded-lg divide-y">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="px-4 py-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-4 w-full max-w-md" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Szukaj turnieju..."
          icon={<Search className="h-4 w-4" />}
          className="flex-1 min-w-[200px]"
          debounce={300}
        />

        <Select value={teamLimitFilter} onValueChange={setTeamLimitFilter}>
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="Liczba drużyn" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie</SelectItem>
            <SelectItem value="8">8 drużyn</SelectItem>
            <SelectItem value="16">16 drużyn</SelectItem>
            <SelectItem value="32">32 drużyny</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2 items-center">
          <DatePicker
            date={startDate}
            onDateChange={setStartDate}
            placeholder="Data od"
          />
          <span className="text-muted-foreground">-</span>
          <DatePicker
            date={endDate}
            onDateChange={setEndDate}
            placeholder="Data do"
          />
        </div>
      </div>

      <div className="space-y-2 border border-border rounded-lg divide-y">
        {tournaments.length > 0 ? (
          tournaments.map((tournament) => {
            const isFull =
              (tournament.lobbies?.length || 0) >= tournament.teamLimit;
            const currentTeams = tournament.lobbies?.length || 0;
            const organization = tournament.organization as
              | { id: number; name: string }
              | undefined;

            return (
              <div
                key={tournament.id}
                className="px-4 py-4 hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => router.push(`/tournaments/${tournament.id}`)}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-foreground">
                          {tournament.name}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {organization?.name || 'Organizacja'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {tournament.description || 'Brak opisu'}
                      </p>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/tournaments/${tournament.id}`);
                      }}
                      disabled={isFull}
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      Dołącz
                    </Button>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(tournament.startsAt).toLocaleDateString(
                          'pl-PL',
                          {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>
                        {currentTeams}/{tournament.teamLimit} drużyn
                      </span>
                    </div>
                    <Badge variant={isFull ? 'destructive' : 'default'}>
                      {isFull ? 'Pełny' : 'Otwarte zapisy'}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-4 py-8 text-center text-muted-foreground">
            {searchTerm
              ? 'Nie znaleziono turniejów'
              : 'Brak dostępnych turniejów'}
          </div>
        )}
      </div>
    </div>
  );
}
