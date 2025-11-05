"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { SearchBar } from "@/components/ui/search-bar";
import { ApplyToTeamButton } from "@/components/teams/apply-to-team-button";
import { useTeamPostingControllerPostings } from "@/lib/api/postings/postings";
import { useCurrentUser } from "@/lib/providers/auth-provider";
import { useTeamControllerTeams } from "@/lib/api/teams/teams";
import { EditPostingDialog } from "@/components/posting/edit-posting-dialog";
import { DeletePostingDialog } from "@/components/posting/delete-posting-dialog";

export function TeamPosting() {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useCurrentUser();

  const { data: postingsData, isLoading } = useTeamPostingControllerPostings({
    search: searchTerm,
  });

  const { data: myTeamsData } = useTeamControllerTeams(
    user?.playerAccount?.id ? { members: [user.playerAccount.id] } : undefined
  );

  const teamPosts = postingsData?.data || [];
  const myTeams = myTeamsData?.data || [];

  // Only show OPEN postings
  const filteredPosts = teamPosts.filter((post) => post.status === "OPEN");

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Szukaj ogłoszeń drużyn..."
            icon={<Search className="h-4 w-4" />}
            className="flex-1"
            debounce={300}
          />
          <Button variant="secondary" size="default" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtry
          </Button>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          Ładowanie ogłoszeń...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Szukaj ogłoszeń drużyn..."
          icon={<Search className="h-4 w-4" />}
          className="flex-1"
          debounce={300}
        />
        <Button variant="secondary" size="default" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtry
        </Button>
      </div>

      <div className="space-y-2 border border-border rounded-lg divide-y">
        <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-muted/50 text-sm font-medium text-muted-foreground">
          <div className="col-span-3">Drużyna</div>
          <div className="col-span-2">Pozycje</div>
          <div className="col-span-2">Opis</div>
          <div className="col-span-2">Zaktualizowano</div>
          <div className="col-span-3 text-center">Akcja</div>
        </div>

        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            const isMyTeamPosting = myTeams.some(
              (team) => team.id === post.team.id
            );
            const updatedAt = new Date(post.updatedAt).toLocaleDateString(
              "pl-PL",
              {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }
            );

            return (
              <div
                key={post.id}
                className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-muted/30 transition-colors text-sm"
              >
                <div className="col-span-3">
                  <p className="font-medium text-foreground">{post.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {post.team.name}
                  </p>
                </div>
                <div className="col-span-2">
                  <div className="flex gap-1 flex-wrap">
                    {post.rolesNeeded?.map((role: string) => (
                      <Badge key={role} variant="secondary" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {post.description}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">{updatedAt}</p>
                </div>
                <div className="col-span-3 flex items-center justify-center gap-2">
                  {isMyTeamPosting ? (
                    <>
                      <EditPostingDialog
                        type="team"
                        postingId={post.id}
                        teamId={post.teamId}
                        initialTitle={post.title}
                        initialDescription={post.description}
                        initialRolesNeeded={post.rolesNeeded}
                      />
                      <DeletePostingDialog
                        type="team"
                        postingId={post.id}
                        postingTitle={post.title}
                      />
                    </>
                  ) : (
                    <ApplyToTeamButton
                      teamId={post.team.id}
                      size="sm"
                      className="text-xs h-8"
                    />
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-4 py-8 text-center text-muted-foreground">
            Brak ogłoszeń drużyn
          </div>
        )}
      </div>
    </div>
  );
}
