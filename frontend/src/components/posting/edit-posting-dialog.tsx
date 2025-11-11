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
import { Pencil } from "lucide-react";
import {
  useTeamPostingControllerUpdate,
  usePlayerPostingControllerUpdate,
} from "@/lib/api/postings/postings";
import { toast } from "sonner";
import { TeamPostingCreateDtoRolesNeededItem } from "@/lib/api/model";
import { RoleSelector } from "@/components/ui/role-selector";

interface EditPostingDialogProps {
  type: "team" | "player";
  postingId: number;
  teamId?: number;
  initialTitle: string;
  initialDescription?: string;
  initialRolesNeeded?: string[];
}

export function EditPostingDialog({
  type,
  postingId,
  teamId,
  initialTitle,
  initialDescription,
  initialRolesNeeded,
}: EditPostingDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription || "");
  const [rolesNeeded, setRolesNeeded] = useState<
    TeamPostingCreateDtoRolesNeededItem[]
  >((initialRolesNeeded as TeamPostingCreateDtoRolesNeededItem[]) || []);

  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
      setDescription(initialDescription || "");
      setRolesNeeded(
        (initialRolesNeeded as TeamPostingCreateDtoRolesNeededItem[]) || []
      );
    }
  }, [open, initialTitle, initialDescription, initialRolesNeeded]);

  const updateTeamMutation = useTeamPostingControllerUpdate({
    mutation: {
      onSuccess: () => {
        toast.success("Ogłoszenie zostało zaktualizowane");
        setOpen(false);
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message ||
            "Błąd podczas aktualizacji ogłoszenia"
        );
      },
    },
  });

  const updatePlayerMutation = usePlayerPostingControllerUpdate({
    mutation: {
      onSuccess: () => {
        toast.success("Ogłoszenie zostało zaktualizowane");
        setOpen(false);
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message ||
            "Błąd podczas aktualizacji ogłoszenia"
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

    if (type === "team") {
      if (!teamId || rolesNeeded.length === 0) {
        toast.error("Wypełnij wszystkie wymagane pola");
        return;
      }

      updateTeamMutation.mutate({
        id: postingId,
        data: {
          teamId,
          title,
          description: description || undefined,
          rolesNeeded,
        },
      });
    } else {
      updatePlayerMutation.mutate({
        id: postingId,
        data: {
          title,
          description: description || undefined,
        },
      });
    }
  };

  const roles = Object.values(TeamPostingCreateDtoRolesNeededItem);
  const isPending =
    type === "team"
      ? updateTeamMutation.isPending
      : updatePlayerMutation.isPending;

  const handleRoleToggle = (role: string) => {
    const roleValue = role as TeamPostingCreateDtoRolesNeededItem;
    if (rolesNeeded.includes(roleValue)) {
      setRolesNeeded(rolesNeeded.filter((r) => r !== roleValue));
    } else {
      setRolesNeeded([...rolesNeeded, roleValue]);
    }
  };

  return (
    <>
      <Button
        variant="secondary"
        size="default"
        className="gap-2"
        onClick={() => setOpen(true)}
      >
        <Pencil className="h-4 w-4" />
        Edytuj
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edytuj Ogłoszenie</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-posting-title">Tytuł *</Label>
              <Input
                id="edit-posting-title"
                placeholder={
                  type === "team"
                    ? "np. Szukamy ADC i Supporta"
                    : "np. Szukam drużyny jako ADC"
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {type === "team" && (
              <div className="space-y-2">
                <Label htmlFor="edit-posting-roles">
                  Poszukiwane pozycje *
                </Label>
                <RoleSelector
                  roles={roles}
                  selectedRoles={rolesNeeded}
                  onRoleToggle={handleRoleToggle}
                  multiSelect={true}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-posting-description">Opis</Label>
              <Textarea
                id="edit-posting-description"
                placeholder={
                  type === "team"
                    ? "Opisz wymagania i oczekiwania..."
                    : "Opisz swoje doświadczenie i oczekiwania..."
                }
                className="min-h-24 resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending ? "Zapisywanie..." : "Zapisz"}
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
