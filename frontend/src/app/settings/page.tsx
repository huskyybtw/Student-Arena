"use client";

import { NavBar } from "@/components/ui/nav-bar";
import { ProfileCard } from "@/components/settings/profile-card";
import { StudentInfoCard } from "@/components/settings/student-info-card";
import { GameInfoCard } from "@/components/settings/game-info-card";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/hooks/current-user";
import { toast } from "sonner";

const RoleIcon = ({
  role,
  isSelected,
  onClick,
  disabled,
}: {
  role: string;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) => {
  const roleData = {
    top: { name: "Top", icon: "🗡️" },
    jungle: { name: "Jungle", icon: "🌿" },
    mid: { name: "Mid", icon: "⚡" },
    adc: { name: "ADC", icon: "🏹" },
    support: { name: "Support", icon: "🛡️" },
  };

  const data = roleData[role as keyof typeof roleData];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
        disabled
          ? "border-border/50 bg-muted/30 text-muted-foreground cursor-not-allowed opacity-50"
          : isSelected
          ? "border-primary bg-primary/10 text-primary shadow-md"
          : "border-border bg-background hover:border-primary/50 hover:bg-muted/50"
      }`}
    >
      <div
        className={`text-2xl transition-transform duration-200 ${
          isSelected ? "scale-110" : "group-hover:scale-105"
        }`}
      >
        {data.icon}
      </div>
      <span className="text-xs font-medium">{data.name}</span>
      {isSelected && !disabled && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background" />
      )}
    </button>
  );
};

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading, isError } = useCurrentUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <NavBar />
      <main className="container mx-auto px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <ProfileCard loading={isLoading} user={user} />
          <StudentInfoCard loading={isLoading} />
          <GameInfoCard loading={isLoading} />
        </div>
      </main>
    </div>
  );
}
