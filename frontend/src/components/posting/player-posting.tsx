"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { SearchBar } from "@/components/ui/search-bar";
import { usePlayerPostingControllerPostings } from "@/lib/api/postings/postings";
import { useCurrentUser } from "@/lib/providers/auth-provider";
import { EditPostingDialog } from "@/components/posting/edit-posting-dialog";
import { DeletePostingDialog } from "@/components/posting/delete-posting-dialog";

export function PlayerPosting() {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useCurrentUser();

  const { data: postingsData, isLoading } = usePlayerPostingControllerPostings({
    search: searchTerm,
  });

  const playerPosts = postingsData?.data || [];

  // Only show OPEN postings
  const filteredPosts = playerPosts.filter((post) => post.status === "OPEN");

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Szukaj ogłoszeń graczy..."
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
          placeholder="Szukaj ogłoszeń graczy..."
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
          <div className="col-span-3">Gracz</div>
          <div className="col-span-3">Opis</div>
          <div className="col-span-3">Zaktualizowano</div>
          <div className="col-span-3 text-center">Akcja</div>
        </div>

        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            const isMyPosting = user?.playerAccount?.id === post.playerId;
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
                    {post.player.gameName}#{post.player.tagLine}
                  </p>
                </div>
                <div className="col-span-3">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {post.description}
                  </p>
                </div>
                <div className="col-span-3">
                  <p className="text-xs text-muted-foreground">{updatedAt}</p>
                </div>
                <div className="col-span-3 flex items-center justify-center gap-2">
                  {isMyPosting ? (
                    <>
                      <EditPostingDialog
                        type="player"
                        postingId={post.id}
                        initialTitle={post.title}
                        initialDescription={post.description}
                      />
                      <DeletePostingDialog
                        type="player"
                        postingId={post.id}
                        postingTitle={post.title}
                      />
                    </>
                  ) : (
                    <Button size="sm" className="text-xs h-8">
                      Zaproś
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-4 py-8 text-center text-muted-foreground">
            Brak ogłoszeń graczy
          </div>
        )}
      </div>
    </div>
  );
}
