import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { UserPlus, Users, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useTournamentsControllerJoin } from "@/lib/api/tournaments/tournaments";
import { useTeamControllerTeams } from "@/lib/api/teams/teams";
import { useCurrentUser } from "@/lib/providers/auth-provider";
import { useQueryClient } from "@tanstack/react-query";

interface JoinTournamentDialogProps {
  tournamentId: number;
  tournamentName: string;
  disabled?: boolean;
}

export function JoinTournamentDialog({
  tournamentId,
  tournamentName,
  disabled,
}: JoinTournamentDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();

  const { data: teamsData } = useTeamControllerTeams(
    user?.playerAccount?.id ? { members: [user.playerAccount.id] } : undefined
  );

  const joinMutation = useTournamentsControllerJoin({
    mutation: {
      onSuccess: () => {
        toast.success("Pomyślnie dołączono do turnieju!");
        queryClient.invalidateQueries({
          queryKey: [`http://localhost:3001/tournaments/${tournamentId}`],
        });
        queryClient.invalidateQueries({
          queryKey: ["http://localhost:3001/tournaments"],
        });
        setOpen(false);
        setSelectedTeamId("");
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Nie udało się dołączyć do turnieju"
        );
      },
    },
  });

  const teams = teamsData?.data || [];
  const selectedTeam = teams.find((t) => t.id === Number(selectedTeamId));
  const canJoin = selectedTeam?.members && selectedTeam.members.length === 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canJoin) {
      toast.error("Ta drużyna nie spełnia wymagań turnieju");
      return;
    }

    joinMutation.mutate({
      id: tournamentId,
      teamId: Number(selectedTeamId),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="default"
          className="gap-2"
          disabled={disabled}
        >
          <UserPlus className="h-4 w-4" />
          Dołącz z drużyną
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Dołącz do turnieju
            </DialogTitle>
            <DialogDescription>
              Wybierz drużynę, z którą chcesz dołączyć do turnieju &quot;
              {tournamentName}&quot;
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {teams.length === 0 ? (
              <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-muted/50">
                <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-foreground font-medium">
                    Brak drużyn
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Nie masz żadnej drużyny. Stwórz lub dołącz do drużyny, aby
                    wziąć udział w turnieju.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="team">Wybierz drużynę</Label>
                  <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                    <SelectTrigger id="team">
                      <SelectValue placeholder="Wybierz drużynę..." />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={String(team.id)}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{team.name}</span>
                            <span className="text-xs text-muted-foreground">
                              [{team.tag}]
                            </span>
                            <span className="text-xs text-muted-foreground">
                              · {team.members?.length || 0}/5 członków
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTeam &&
                  selectedTeam.members &&
                  selectedTeam.members.length < 5 && (
                  <div className="flex items-start gap-3 p-4 rounded-lg border border-destructive bg-destructive/10">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-destructive font-medium">
                        Niewystarczająca liczba członków
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Ta drużyna nie ma wymaganych 5 członków. Dodaj brakujących
                        graczy przed dołączeniem do turnieju.
                      </p>
                    </div>
                  </div>
                )}

                {selectedTeam &&
                  selectedTeam.members &&
                  selectedTeam.members.length === 5 && (
                  <div className="flex items-start gap-3 p-4 rounded-lg border border-primary bg-primary/10">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-primary font-medium">
                        Drużyna gotowa
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Drużyna spełnia wymagania. Możesz dołączyć do turnieju.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={joinMutation.isPending}
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              disabled={
                joinMutation.isPending ||
                !canJoin ||
                teams.length === 0 ||
                !selectedTeamId
              }
            >
              {joinMutation.isPending ? "Dołączanie..." : "Dołącz do turnieju"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
