"use client";

import { useState } from "react";
import { TeamPosting } from "@/components/posting/team-posting";
import { PlayerPosting } from "@/components/posting/player-posting";
import { TabSwitcher } from "@/components/ui/tab-switcher";
import { CreatePostingDialog } from "@/components/posting/create-posting-dialog";

export default function PostingPage() {
  const [activeTab, setActiveTab] = useState<"teams" | "players">("teams");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
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
      </main>
    </div>
  );
}
