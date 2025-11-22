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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus, Trophy } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useTournamentsControllerCreate } from "@/lib/api/tournaments/tournaments";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface RoundDate {
  date?: Date;
  time: string;
}

export function CreateTournamentDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rounds, setRounds] = useState("3");
  const [roundDates, setRoundDates] = useState<RoundDate[]>([
    { time: "18:00" },
    { time: "18:00" },
    { time: "18:00" },
  ]);
  const queryClient = useQueryClient();

  const createMutation = useTournamentsControllerCreate({
    mutation: {
      onSuccess: () => {
        toast.success("Turniej został utworzony");
        queryClient.invalidateQueries({
          queryKey: ["http://localhost:3001/tournaments"],
        });
        setName("");
        setDescription("");
        setRounds("3");
        setRoundDates([
          { time: "18:00" },
          { time: "18:00" },
          { time: "18:00" },
        ]);
        setOpen(false);
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Błąd podczas tworzenia turnieju"
        );
      },
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all rounds have dates
    const numRounds = Number(rounds);
    for (let i = 0; i < numRounds; i++) {
      if (!roundDates[i]?.date) {
        toast.error(`Data rundy ${i + 1} jest wymagana`);
        return;
      }
    }

    // Convert rounds array to proper format
    const roundsArray = roundDates.slice(0, numRounds).map((roundDate, i) => {
      // Create date in local timezone
      const dateStr = format(roundDate.date!, "yyyy-MM-dd");
      const timeStr = roundDate.time;
      const dateTime = new Date(`${dateStr}T${timeStr}:00`);

      return {
        round: i + 1,
        date: dateTime.toISOString(),
      };
    });

    // Use first round's date as tournament start date
    const startsAt = roundsArray[0].date;

    createMutation.mutate({
      data: {
        name,
        description: description || undefined,
        startsAt,
        rounds: roundsArray,
      },
    });
  };

  const handleRoundsChange = (value: string) => {
    const numRounds = Number(value);
    setRounds(value);

    // Adjust roundDates array to match new rounds count
    const newRoundDates = Array.from(
      { length: numRounds },
      (_, i) => roundDates[i] || { time: "18:00" }
    );
    setRoundDates(newRoundDates);
  };

  const updateRoundDate = (index: number, date?: Date) => {
    const newRoundDates = [...roundDates];
    newRoundDates[index] = { ...newRoundDates[index], date };
    setRoundDates(newRoundDates);
  };

  const updateRoundTime = (index: number, time: string) => {
    const newRoundDates = [...roundDates];
    newRoundDates[index] = { ...newRoundDates[index], time };
    setRoundDates(newRoundDates);
  };

  const teamLimit = Math.pow(2, Number(rounds));
  const numRounds = Number(rounds);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="default" className="gap-2">
          <Plus className="h-4 w-4" />
          Stwórz Turniej
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Stwórz nowy turniej
            </DialogTitle>
            <DialogDescription>
              Stwórz turniej dla swojej organizacji. Będziesz mógł zarządzać
              zapisami i wynikami.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nazwa turnieju</Label>
              <Input
                id="name"
                placeholder="np. Spring Championship 2024"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Opis (opcjonalnie)</Label>
              <Textarea
                id="description"
                placeholder="Krótki opis turnieju..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rounds">Liczba rund</Label>
              <Select value={rounds} onValueChange={handleRoundsChange}>
                <SelectTrigger id="rounds">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 rundy (4 drużyny)</SelectItem>
                  <SelectItem value="3">3 rundy (8 drużyn)</SelectItem>
                  <SelectItem value="4">4 rundy (16 drużyn)</SelectItem>
                  <SelectItem value="5">5 rund (32 drużyny)</SelectItem>
                  <SelectItem value="6">6 rund (64 drużyny)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Turniej będzie miał maksymalnie {teamLimit} drużyn
              </p>
            </div>

            <div className="space-y-3">
              <Label>Daty i godziny rund</Label>
              <p className="text-xs text-muted-foreground">
                Wszystkie mecze w rundzie odbywają się równolegle
              </p>
              {Array.from({ length: numRounds }).map((_, index) => (
                <div key={index} className="space-y-2 p-3 border rounded-lg">
                  <Label className="text-sm font-medium">
                    Runda {index + 1}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal text-sm",
                            !roundDates[index]?.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {roundDates[index]?.date ? (
                            format(roundDates[index].date!, "PPP", {
                              locale: pl,
                            })
                          ) : (
                            <span>Wybierz datę</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={roundDates[index]?.date}
                          onSelect={(date) => updateRoundDate(index, date)}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Input
                      type="time"
                      value={roundDates[index]?.time || "18:00"}
                      onChange={(e) => updateRoundTime(index, e.target.value)}
                      required
                      className="text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createMutation.isPending}
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              disabled={
                createMutation.isPending ||
                !name ||
                roundDates.slice(0, numRounds).some((rd) => !rd.date)
              }
            >
              {createMutation.isPending ? "Tworzenie..." : "Stwórz turniej"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
