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
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { lobbySchema, LobbyFormData } from "@/lib/validators/lobbySchema";

export function CreateLobbyDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const createLobbyMutation = useLobbyControllerCreate({
    mutation: {
      onSuccess: () => {
        toast.success("Lobby zostało utworzone");
        queryClient.invalidateQueries({
          queryKey: getLobbyControllerFindAllQueryKey(),
        });
        setOpen(false);
        reset();
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Błąd podczas tworzenia lobby"
        );
      },
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LobbyFormData>({
    resolver: yupResolver(lobbySchema),
    defaultValues: {
      title: "",
      description: "",
      ranked: false,
      matchType: "",
      date: undefined,
    },
  });

  const onSubmit = (data: LobbyFormData) => {
    createLobbyMutation.mutate({
      data: {
        ...data,
        matchType: data.matchType as LobbyCreateDTOMatchType,
        date: data.date.toISOString(),
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-lobby-title">Tytuł *</Label>
              <Input
                id="create-lobby-title"
                placeholder="np. Rankingowe 5v5"
                {...register("title")}
                className="bg-card/50 border-border"
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-lobby-description">Opis</Label>
              <Textarea
                id="create-lobby-description"
                placeholder="Opisz szczegóły meczu..."
                className="min-h-24 resize-none bg-card/50 border-border"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-lobby-matchType">Typ meczu *</Label>
              <Controller
                name="matchType"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
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
                )}
              />
              {errors.matchType && (
                <p className="text-xs text-red-500">
                  {errors.matchType.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-lobby-date">Data meczu *</Label>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    date={field.value}
                    onDateChange={field.onChange}
                    placeholder="Wybierz datę i godzinę"
                    className="w-full"
                    showTime
                  />
                )}
              />
              {errors.date && (
                <p className="text-xs text-red-500">{errors.date.message}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Controller
                name="ranked"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="create-lobby-ranked"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
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
                disabled={isSubmitting || createLobbyMutation.isPending}
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
