"use client";

import { useState } from "react";
import { MyTeams } from "@/components/teams/my-teams";
import { FindTeams } from "@/components/teams/find-teams";
import { CreateTeamDialog } from "@/components/teams/create-team-dialog";

export default function TeamsPage() {
  const [activeTab, setActiveTab] = useState<"my-teams" | "search">("my-teams");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-card/80 backdrop-blur-sm rounded-lg p-1 flex gap-1 border border-border/50">
              <button
                onClick={() => setActiveTab("my-teams")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === "my-teams"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Moje Drużyny
              </button>
              <button
                onClick={() => setActiveTab("search")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === "search"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Szukaj Drużyny
              </button>
            </div>
          </div>
          <CreateTeamDialog />
        </div>

        {activeTab === "my-teams" && <MyTeams />}

        {activeTab === "search" && <FindTeams />}
      </main>
    </div>
  );
}
