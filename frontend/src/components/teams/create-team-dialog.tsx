"use client";

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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useTeamControllerCreate } from "@/lib/api/teams/teams";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  createTeamSchema,
  CreateTeamFormData,
} from "@/lib/validators/teamSchema";

export function CreateTeamDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const createTeamMutation = useTeamControllerCreate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["teams"] });
        toast.success("Drużyna została utworzona");
        setIsOpen(false);
        reset();
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Błąd podczas tworzenia drużyny"
        );
      },
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTeamFormData>({
    resolver: yupResolver(createTeamSchema),
    defaultValues: {
      name: "",
      tag: "",
      description: "",
    },
  });

  const onSubmit = (data: CreateTeamFormData) => {
    createTeamMutation.mutate({ data });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <Plus className="h-4 w-4" />
          Stwórz Drużynę
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Stwórz Nową Drużynę</DialogTitle>
          <DialogDescription>
            Wypełnij informacje o swojej nowej drużynie
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Nazwa Drużyny</Label>
              <Input
                id="team-name"
                placeholder="np. Akademickie Legendy"
                {...register("name")}
                className="h-11"
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-tag">Tag Drużyny</Label>
              <Input
                id="team-tag"
                placeholder="np. AKL"
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
                placeholder="Opisz swoją drużynę..."
                {...register("description")}
                className="min-h-24"
              />
              {errors.description && (
                <p className="text-xs text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsOpen(false)}
            >
              Anuluj
            </Button>
            <Button variant="default" type="submit" disabled={isSubmitting}>
              Stwórz Drużynę
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
