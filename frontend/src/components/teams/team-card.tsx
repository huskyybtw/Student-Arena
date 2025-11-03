import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Crown, Settings } from "lucide-react";
import Link from "next/link";
import { TeamResponseDto } from "@/lib/api/model";

interface TeamCardProps {
  team: TeamResponseDto;
  isOwner?: boolean;
  showRecruitingBadge?: boolean;
  variant?: "grid" | "list";
}

export function TeamCard({
  team,
  isOwner,
  showRecruitingBadge,
  variant = "grid",
}: TeamCardProps) {
  const hasOpenSlots = team.members.length < 5;

  if (variant === "list") {
    return (
      <Link href={`/teams/${team.id}`}>
        <Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4 flex-1">
                <TeamAvatarLarge />
                <TeamInfoList
                  team={team}
                  hasOpenSlots={hasOpenSlots}
                  showRecruitingBadge={showRecruitingBadge}
                />
              </div>
              {showRecruitingBadge && hasOpenSlots && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    // TODO: Handle application
                  }}
                >
                  Aplikuj
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/teams/${team.id}`}>
      <Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <TeamAvatar />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{team.name}</h3>
                  {isOwner && <Crown className="h-4 w-4 text-yellow-500" />}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">[{team.tag}]</p>
                  {showRecruitingBadge && hasOpenSlots && (
                    <Badge variant="secondary" className="text-xs">
                      Rekrutuje
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {isOwner && (
              <Button
                variant="secondary"
                size="sm"
                className="gap-2"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `/teams/${team.id}`;
                }}
              >
                <Settings className="h-4 w-4" />
                Zarządzaj
              </Button>
            )}
          </div>
          <div className="flex items-center justify-between text-sm">
            <TeamStats rating={team.rating} memberCount={team.members.length} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function TeamAvatar() {
  return (
    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
      <Users className="h-6 w-6 text-primary-foreground" />
    </div>
  );
}

export function TeamAvatarLarge() {
  return (
    <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
      <Users className="h-7 w-7 text-primary-foreground" />
    </div>
  );
}

export function TeamStats({
  rating,
  memberCount,
}: {
  rating: number;
  memberCount: number;
}) {
  return (
    <div className="flex items-center gap-4">
      <div>
        <p className="text-muted-foreground">Rating</p>
        <p className="font-semibold">{rating}</p>
      </div>
      <div>
        <p className="text-muted-foreground">Członkowie</p>
        <p className="font-semibold">{memberCount}/5</p>
      </div>
    </div>
  );
}

export function TeamInfoList({
  team,
  hasOpenSlots,
  showRecruitingBadge,
}: {
  team: TeamResponseDto;
  hasOpenSlots: boolean;
  showRecruitingBadge?: boolean;
}) {
  return (
    <div className="flex-1">
      <div className="flex items-center gap-3 mb-2">
        <h3 className="font-semibold text-lg">{team.name}</h3>
        <Badge variant="outline" className="text-xs">
          [{team.tag}]
        </Badge>
        {showRecruitingBadge && hasOpenSlots && (
          <Badge variant="secondary" className="text-xs">
            Rekrutuje
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-6 text-sm">
        <div>
          <span className="text-muted-foreground">Rating: </span>
          <span className="font-semibold">{team.rating}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Członkowie: </span>
          <span className="font-semibold">{team.members.length}/5</span>
        </div>
      </div>
    </div>
  );
}
