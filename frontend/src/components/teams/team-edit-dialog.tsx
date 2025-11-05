"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import {
  useTeamControllerUpdate,
  getTeamControllerTeamQueryKey,
} from "@/lib/api/teams/teams";
import {
  updateTeamSchema,
  UpdateTeamFormData,
} from "@/lib/validators/teamSchema";
import { TeamResponseDto } from "@/lib/api/model";

interface TeamEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: TeamResponseDto;
}

export function TeamEditDialog({
  open,
  onOpenChange,
  team,
}: TeamEditDialogProps) {
  const queryClient = useQueryClient();
  const [transferOwnerId, setTransferOwnerId] = useState<string>("");

  const updateTeamMutation = useTeamControllerUpdate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getTeamControllerTeamQueryKey(team.id),
        });
        toast.success("Drużyna została zaktualizowana");
        onOpenChange(false);
        reset();
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Błąd podczas aktualizacji drużyny"
        );
      },
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateTeamFormData>({
    resolver: yupResolver(updateTeamSchema),
    defaultValues: {
      name: team.name,
      tag: team.tag,
      description: team.description,
    },
    values: {
      name: team.name,
      tag: team.tag,
      description: team.description,
    },
  });

  const onSubmit = (data: UpdateTeamFormData) => {
    updateTeamMutation.mutate({
      id: team.id,
      data,
    });
  };

  const handleTransferOwner = () => {
    if (!transferOwnerId) return;

    updateTeamMutation.mutate({
      id: team.id,
      data: {
        name: team.name,
        tag: team.tag,
        description: team.description,
        ownerId: Number.parseInt(transferOwnerId),
      },
    });
    setTransferOwnerId("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[80vw] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edytuj Drużynę</DialogTitle>
          <DialogDescription>
            Zmień informacje o swojej drużynie
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Nazwa drużyny</Label>
              <Input id="team-name" {...register("name")} className="h-11" />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-tag">Tag drużyny</Label>
              <Input
                id="team-tag"
                {...register("tag")}
                className="h-11"
                maxLength={5}
              />
              {errors.tag && (
                <p className="text-xs text-red-500">{errors.tag.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-description">Opis</Label>
              <Textarea
                id="team-description"
                {...register("description")}
                className="min-h-32"
                placeholder="Opis drużyny..."
              />
              {errors.description && (
                <p className="text-xs text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div className="space-y-2 pt-4 border-t border-destructive/20">
              <Label htmlFor="transfer-owner" className="text-destructive">
                Przekaż Właściciela
              </Label>
              <Select
                value={transferOwnerId}
                onValueChange={setTransferOwnerId}
              >
                <SelectTrigger id="transfer-owner" className="h-11">
                  <SelectValue placeholder="Wybierz nowego właściciela" />
                </SelectTrigger>
                <SelectContent>
                  {team.members
                    .filter((member) => member.id !== team.ownerId)
                    .map((member) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        {member.gameName}#{member.tagLine}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {transferOwnerId && (
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full mt-2"
                  onClick={handleTransferOwner}
                >
                  Potwierdź Przekazanie
                </Button>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Anuluj
            </Button>
            <Button variant="default" type="submit" disabled={isSubmitting}>
              Zapisz Zmiany
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
