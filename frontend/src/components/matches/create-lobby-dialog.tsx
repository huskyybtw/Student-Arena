"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import {
  useLobbyControllerCreate,
  getLobbyControllerFindAllQueryKey,
} from "@/lib/api/lobby/lobby";
import { LobbyCreateDTOMatchType } from "@/lib/api/model/lobbyCreateDTOMatchType";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { DatePicker } from "@/components/ui/date-range-picker";

export function CreateLobbyDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ranked, setRanked] = useState(false);
  const [matchType, setMatchType] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>(undefined);

  const queryClient = useQueryClient();

  const createLobbyMutation = useLobbyControllerCreate({
    mutation: {
      onSuccess: () => {
        toast.success("Lobby zostało utworzone");
        queryClient.invalidateQueries({
          queryKey: getLobbyControllerFindAllQueryKey(),
        });
        setOpen(false);
        setTitle("");
        setDescription("");
        setRanked(false);
        setMatchType("");
        setDate(undefined);
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Błąd podczas tworzenia lobby"
        );
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      toast.error("Tytuł jest wymagany");
      return;
    }

    if (!matchType) {
      toast.error("Typ meczu jest wymagany");
      return;
    }

    if (!date) {
      toast.error("Data meczu jest wymagana");
      return;
    }

    if (date < new Date()) {
      toast.error("Data meczu musi być w przyszłości");
      return;
    }

    createLobbyMutation.mutate({
      data: {
        title,
        description,
        ranked,
        matchType: matchType as LobbyCreateDTOMatchType,
        date: date.toISOString(),
      },
    });
  };

  return (
    <>
      <Button variant="default" size="default" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Utwórz Lobby
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Utwórz Nowe Lobby</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-lobby-title">Tytuł *</Label>
              <Input
                id="create-lobby-title"
                placeholder="np. Rankingowe 5v5"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-card/50 border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-lobby-description">Opis</Label>
              <Textarea
                id="create-lobby-description"
                placeholder="Opisz szczegóły meczu..."
                className="min-h-24 resize-none bg-card/50 border-border"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-lobby-matchType">Typ meczu *</Label>
              <Select value={matchType} onValueChange={setMatchType}>
                <SelectTrigger className="bg-card/50 border-border">
                  <SelectValue placeholder="Wybierz typ meczu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LobbyCreateDTOMatchType.Queue}>
                    Dobierane
                  </SelectItem>
                  <SelectItem value={LobbyCreateDTOMatchType.Team}>
                    Zespołowe
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-lobby-date">Data meczu *</Label>
              <DatePicker
                date={date}
                onDateChange={setDate}
                placeholder="Wybierz datę i godzinę"
                className="w-full"
                showTime
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="create-lobby-ranked"
                checked={ranked}
                onCheckedChange={(checked) => setRanked(checked === true)}
              />
              <Label
                htmlFor="create-lobby-ranked"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Mecz rankingowy
              </Label>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={createLobbyMutation.isPending}
              >
                {createLobbyMutation.isPending ? "Tworzenie..." : "Utwórz"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                Anuluj
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
