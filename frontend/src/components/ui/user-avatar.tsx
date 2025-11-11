"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/lib/providers/auth-provider";
import { useEffect, useState } from "react";
import { getProfileIconUrl } from "@/lib/ddragon";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  className?: string;
  fallbackClassName?: string;
}

export function UserAvatar({ className, fallbackClassName }: UserAvatarProps) {
  const { user, isLoading } = useCurrentUser();
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [isLoadingIcon, setIsLoadingIcon] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoadingIcon(false);
      return;
    }

    let mounted = true;
    setIsLoadingIcon(true);
    const id = user?.playerAccount?.profileIconId ?? 1;
    getProfileIconUrl(id).then((url) => {
      if (!mounted) return;
      setIconUrl(url);
      setIsLoadingIcon(false);
    });
    return () => {
      mounted = false;
    };
  }, [user?.playerAccount?.profileIconId, user]);

  if (isLoading || isLoadingIcon) {
    return <Skeleton className={cn("rounded-full", className)} />;
  }

  return (
    <Avatar className={cn(className)}>
      <AvatarImage
        src={iconUrl ?? "/generic-fantasy-champion.png"}
        onError={(e: any) => {
          e.currentTarget.src = "/generic-fantasy-champion.png";
        }}
      />
      <AvatarFallback className={cn(fallbackClassName)}>
        {user?.playerAccount?.gameName?.[0]?.toUpperCase() ?? "PG"}
      </AvatarFallback>
    </Avatar>
  );
}
