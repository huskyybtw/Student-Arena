"use client";

import { useState } from "react";
import { MyTeams } from "@/components/teams/my-teams";
import { FindTeams } from "@/components/teams/find-teams";
import { CreateTeamDialog } from "@/components/teams/create-team-dialog";
import { TabSwitcher } from "@/components/ui/tab-switcher";

export default function TeamsPage() {
  const [activeTab, setActiveTab] = useState<"my-teams" | "search">("my-teams");

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        {/* Page header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Drużyny</h1>
          <p className="text-muted-foreground">
            Zarządzaj swoimi drużynami lub znajdź nową drużynę do dołączenia
          </p>
        </div>

        <div className="flex items-center justify-between">
          <TabSwitcher
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={[
              { value: "my-teams", label: "Moje Drużyny" },
              { value: "search", label: "Szukaj Drużyny" },
            ]}
          />
          <CreateTeamDialog />
        </div>

        {activeTab === "my-teams" && <MyTeams />}

        {activeTab === "search" && <FindTeams />}
      </div>
    </main>
  );
}
