"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import {
  useTeamPostingControllerCreate,
  usePlayerPostingControllerCreate,
} from "@/lib/api/postings/postings";
import { useTeamControllerTeams } from "@/lib/api/teams/teams";
import { useCurrentUser } from "@/lib/providers/auth-provider";
import { toast } from "sonner";
import { TeamPostingCreateDtoRolesNeededItem } from "@/lib/api/model";
import { RoleSelector } from "@/components/ui/role-selector";

interface CreatePostingDialogProps {
  type: "team" | "player";
}

export function CreatePostingDialog({ type }: CreatePostingDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [teamId, setTeamId] = useState<string>("");
  const [rolesNeeded, setRolesNeeded] = useState<
    TeamPostingCreateDtoRolesNeededItem[]
  >([]);

  const { user } = useCurrentUser();
  const { data: teamsData } = useTeamControllerTeams(
    type === "team" && user?.playerAccount?.id
      ? { members: [user.playerAccount.id] }
      : undefined
  );

  const createTeamMutation = useTeamPostingControllerCreate({
    mutation: {
      onSuccess: () => {
        toast.success("Ogłoszenie zostało utworzone");
        setOpen(false);
        resetForm();
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Błąd podczas tworzenia ogłoszenia"
        );
      },
    },
  });

  const createPlayerMutation = usePlayerPostingControllerCreate({
    mutation: {
      onSuccess: () => {
        toast.success("Ogłoszenie zostało utworzone");
        setOpen(false);
        resetForm();
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Błąd podczas tworzenia ogłoszenia"
        );
      },
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTeamId("");
    setRolesNeeded([]);
  };

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

      createTeamMutation.mutate({
        data: {
          teamId: parseInt(teamId),
          title,
          description: description || undefined,
          rolesNeeded,
        },
      });
    } else {
      createPlayerMutation.mutate({
        data: {
          title,
          description: description || undefined,
        },
      });
    }
  };

  const myTeams = teamsData?.data || [];
  const roles = Object.values(TeamPostingCreateDtoRolesNeededItem);
  const isPending =
    type === "team"
      ? createTeamMutation.isPending
      : createPlayerMutation.isPending;

  const handleRoleToggle = (role: string) => {
    const roleValue = role as TeamPostingCreateDtoRolesNeededItem;
    if (rolesNeeded.includes(roleValue)) {
      setRolesNeeded(rolesNeeded.filter((r) => r !== roleValue));
    } else {
      setRolesNeeded([...rolesNeeded, roleValue]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="default">
          <Plus className="h-4 w-4 mr-2" />
          Dodaj Ogłoszenie
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {type === "team"
              ? "Nowe Ogłoszenie Drużyny"
              : "Nowe Ogłoszenie Gracza"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === "team" && (
            <div className="space-y-2">
              <Label htmlFor="create-posting-team">Drużyna *</Label>
              <Select value={teamId} onValueChange={setTeamId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Wybierz drużynę" />
                </SelectTrigger>
                <SelectContent>
                  {myTeams.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name} [{team.tag}]
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="create-posting-title">Tytuł *</Label>
            <Input
              id="create-posting-title"
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
              <Label htmlFor="create-posting-roles">
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
            <Label htmlFor="create-posting-description">Opis</Label>
            <Textarea
              id="create-posting-description"
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
              {isPending ? "Tworzenie..." : "Opublikuj"}
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
  );
}
