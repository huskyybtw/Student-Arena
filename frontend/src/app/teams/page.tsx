"use client";

import { useState } from "react";
import { MyTeams } from "@/components/teams/my-teams";
import { FindTeams } from "@/components/teams/find-teams";
import { CreateTeamDialog } from "@/components/teams/create-team-dialog";
import { TabSwitcher } from "@/components/ui/tab-switcher";

export default function TeamsPage() {
  const [activeTab, setActiveTab] = useState<"my-teams" | "search">("my-teams");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
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
      </main>
    </div>
  );
}
