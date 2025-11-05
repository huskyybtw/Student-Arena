"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { SearchBar } from "@/components/ui/search-bar";
import { Pagination } from "@/components/ui/pagination";
import { usePlayerPostingControllerPostings } from "@/lib/api/postings/postings";
import { useCurrentUser } from "@/lib/providers/auth-provider";
import { EditPostingDialog } from "@/components/posting/edit-posting-dialog";
import { DeletePostingDialog } from "@/components/posting/delete-posting-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function PlayerPosting() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { user } = useCurrentUser();

  const { data: postingsData, isLoading } = usePlayerPostingControllerPostings({
    search: searchTerm,
    page: currentPage,
    limit: itemsPerPage,
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

        {/* Loading skeletons */}
        <Card className="bg-card border-border overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/30 text-xs font-medium text-muted-foreground border-b border-border">
            <div className="col-span-3">Gracz</div>
            <div className="col-span-3">Opis</div>
            <div className="col-span-3">Zaktualizowano</div>
            <div className="col-span-3 text-center">Akcja</div>
          </div>
          <CardContent className="p-0 divide-y divide-border">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 gap-4 px-4 py-4 items-center"
              >
                <div className="col-span-3 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="col-span-3">
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="col-span-3">
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="col-span-3 flex items-center justify-center gap-2">
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <SearchBar
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
            setCurrentPage(1);
          }}
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

      {/* Pagination */}
      {!isLoading && filteredPosts.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredPosts.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
