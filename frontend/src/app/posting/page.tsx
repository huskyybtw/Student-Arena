"use client";

import { useState } from "react";
import { TeamPosting } from "@/components/posting/team-posting";
import { PlayerPosting } from "@/components/posting/player-posting";
import { TabSwitcher } from "@/components/ui/tab-switcher";
import { CreatePostingDialog } from "@/components/posting/create-posting-dialog";

export default function PostingPage() {
  const [activeTab, setActiveTab] = useState<"teams" | "players">("teams");

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        {/* Page header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Ogłoszenia</h1>
          <p className="text-muted-foreground">
            Przeglądaj ogłoszenia drużyn szukających graczy lub graczy
            szukających drużyn
          </p>
        </div>

        <div className="flex items-center justify-between">
          <TabSwitcher
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={[
              { value: "teams", label: "Ogłoszenia Drużyn" },
              { value: "players", label: "Ogłoszenia Graczy" },
            ]}
          />
          <CreatePostingDialog
            type={activeTab === "teams" ? "team" : "player"}
          />
        </div>

        {activeTab === "teams" && <TeamPosting />}

        {activeTab === "players" && <PlayerPosting />}
      </div>
    </main>
  );
}
