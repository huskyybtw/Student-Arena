"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getRoleIconUrl, roleFallbackIcons } from "@/lib/ddragon";

interface RoleIconProps {
  role: string;
  className?: string;
  size?: number;
}

export function RoleIcon({ role, className, size = 24 }: RoleIconProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const iconUrl = getRoleIconUrl(role);

  if (hasError) {
    return (
      <span
        className={cn("flex items-center justify-center", className)}
        style={{ fontSize: size }}
      >
        {roleFallbackIcons[role] || "🎮"}
      </span>
    );
  }

  return (
    <>
      {isLoading && (
        <Skeleton
          className={cn("rounded", className)}
          style={{ width: size, height: size }}
        />
      )}
      <img
        src={iconUrl}
        alt={`${role} icon`}
        width={size}
        height={size}
        className={cn(className, isLoading ? "hidden" : "block")}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </>
  );
}
