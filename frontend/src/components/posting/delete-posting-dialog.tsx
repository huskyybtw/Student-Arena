"use client";

import { useState } from "react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  useTeamPostingControllerDelete,
  usePlayerPostingControllerDelete,
} from "@/lib/api/postings/postings";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeletePostingDialogProps {
  type: "team" | "player";
  postingId: number;
  postingTitle: string;
}

export function DeletePostingDialog({
  type,
  postingId,
  postingTitle,
}: DeletePostingDialogProps) {
  const [open, setOpen] = useState(false);

  const deleteTeamMutation = useTeamPostingControllerDelete({
    mutation: {
      onSuccess: () => {
        toast.success("Ogłoszenie zostało usunięte");
        setOpen(false);
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Błąd podczas usuwania ogłoszenia"
        );
      },
    },
  });

  const deletePlayerMutation = usePlayerPostingControllerDelete({
    mutation: {
      onSuccess: () => {
        toast.success("Ogłoszenie zostało usunięte");
        setOpen(false);
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Błąd podczas usuwania ogłoszenia"
        );
      },
    },
  });

  const handleDelete = () => {
    if (type === "team") {
      deleteTeamMutation.mutate({ id: postingId });
    } else {
      deletePlayerMutation.mutate({ id: postingId });
    }
  };

  const isPending =
    type === "team"
      ? deleteTeamMutation.isPending
      : deletePlayerMutation.isPending;

  return (
    <>
      <Button
        variant="secondary"
        size="default"
        className="gap-2"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
        Usuń
      </Button>
      <ConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="Usuń ogłoszenie"
        description={`Czy na pewno chcesz usunąć ogłoszenie "${postingTitle}"? Tej akcji nie można cofnąć.`}
        onConfirm={handleDelete}
        confirmText="Usuń"
        cancelText="Anuluj"
        isLoading={isPending}
        variant="destructive"
      />
    </>
  );
}
