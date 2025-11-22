"use client";

import { useState } from "react";
import { TournamentsList } from "@/components/tournaments/tournaments-list";
import { CreateTournamentDialog } from "@/components/tournaments/create-tournament-dialog";

export default function TournamentsPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        {/* Page header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Turnieje</h1>
          <p className="text-muted-foreground">
            Przeglądaj nadchodzące turnieje lub stwórz własny turniej dla swojej
            organizacji
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              Filtruj turnieje po dacie rozpoczęcia i liczbie drużyn
            </p>
          </div>
          <CreateTournamentDialog />
        </div>

        <TournamentsList />
      </div>
    </main>
  );
}
