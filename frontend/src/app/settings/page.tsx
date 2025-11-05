"use client";

import { ProfileCard } from "@/components/settings/profile-card";
import { StudentInfoCard } from "@/components/settings/student-info-card";
import { GameInfoCard } from "@/components/settings/game-info-card";
import { useCurrentUser } from "@/lib/providers/auth-provider";

export default function SettingsPage() {
  const { user, isLoading } = useCurrentUser();

  return (
    <main className="container mx-auto px-4 py-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <ProfileCard loading={isLoading} user={user} />
        <StudentInfoCard loading={isLoading} user={user} />
        <GameInfoCard loading={isLoading} user={user} />
      </div>
    </main>
  );
}
