"use client";

import { useState, useEffect } from "react";
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
import { Pencil } from "lucide-react";
import { useLobbyControllerUpdate } from "@/lib/api/lobby/lobby";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface EditLobbyDialogProps {
  lobbyId: number;
  initialTitle: string;
  initialDescription?: string;
  initialRanked: boolean;
  initialDate: Date;
}

export function EditLobbyDialog({
  lobbyId,
  initialTitle,
  initialDescription,
  initialRanked,
  initialDate,
}: EditLobbyDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription || "");
  const [ranked, setRanked] = useState(initialRanked);
  const [date, setDate] = useState(
    new Date(initialDate).toISOString().slice(0, 16)
  );

  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
      setDescription(initialDescription || "");
      setRanked(initialRanked);
      setDate(new Date(initialDate).toISOString().slice(0, 16));
    }
  }, [open, initialTitle, initialDescription, initialRanked, initialDate]);

  const updateLobbyMutation = useLobbyControllerUpdate({
    mutation: {
      onSuccess: () => {
        toast.success("Lobby zostało zaktualizowane");
        queryClient.invalidateQueries({ queryKey: ["lobbyControllerFindAll"] });
        queryClient.invalidateQueries({
          queryKey: ["lobbyControllerFindOne", lobbyId],
        });
        setOpen(false);
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Błąd podczas aktualizacji lobby"
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

    if (!date) {
      toast.error("Data meczu jest wymagana");
      return;
    }

    updateLobbyMutation.mutate({
      id: lobbyId,
      data: {
        title,
        description: description || undefined,
        ranked,
        date: new Date(date).toISOString(),
      },
    });
  };

  return (
    <>
      <Button variant="secondary" size="default" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4 mr-2" />
        Edytuj
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edytuj Lobby</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tytuł *</Label>
              <Input
                id="title"
                placeholder="np. Rankingowe 5v5"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Opis</Label>
              <Textarea
                id="description"
                placeholder="Opisz szczegóły meczu..."
                className="min-h-24 resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data meczu *</Label>
              <Input
                id="date"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="ranked"
                checked={ranked}
                onCheckedChange={(checked) => setRanked(checked === true)}
              />
              <Label
                htmlFor="ranked"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Mecz rankingowy
              </Label>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={updateLobbyMutation.isPending}
              >
                {updateLobbyMutation.isPending ? "Zapisywanie..." : "Zapisz"}
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
