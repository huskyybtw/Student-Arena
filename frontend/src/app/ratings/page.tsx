"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { SearchBar } from "@/components/ui/search-bar";
import { TabSwitcher } from "@/components/ui/tab-switcher";
import { Pagination } from "@/components/ui/pagination";
import { RatingsTable } from "@/components/ratings/ratings-table";
import { usePlayerControllerPlayers } from "@/lib/api/player/player";
import { useTeamControllerTeams } from "@/lib/api/teams/teams";

type ViewType = "players" | "teams";

export default function RatingsPage() {
  const [viewType, setViewType] = useState<ViewType>("players");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch players sorted by rating
  const { data: playersData, isLoading: playersLoading } =
    usePlayerControllerPlayers({
      search: searchTerm,
      sortBy: "rating",
      sortOrder: "desc",
      page: currentPage,
      limit: itemsPerPage,
    });

  // Fetch teams sorted by rating
  const { data: teamsData, isLoading: teamsLoading } = useTeamControllerTeams({
    search: searchTerm,
    sortBy: "rating",
    sortOrder: "desc",
    page: currentPage,
    limit: itemsPerPage,
  });

  const players = playersData?.data || [];
  const teams = teamsData?.data || [];

  const isLoading = viewType === "players" ? playersLoading : teamsLoading;
  const currentData = viewType === "players" ? players : teams;

  const tabs = [
    { value: "players" as const, label: "Gracze" },
    { value: "teams" as const, label: "Drużyny" },
  ];

  const handleTabChange = (tab: ViewType) => {
    setViewType(tab);
    setCurrentPage(1);
    setSearchTerm("");
  };

  const startRank = (currentPage - 1) * itemsPerPage + 1;

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        {/* Page header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Rankingi</h1>
          <p className="text-muted-foreground">
            Sprawdź najlepszych graczy i drużyny posortowanych według ratingu
          </p>
        </div>

        {/* Search and tab switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <SearchBar
            value={searchTerm}
            onChange={(value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }}
            placeholder={`Szukaj ${
              viewType === "players" ? "gracza..." : "drużyny..."
            }`}
            icon={<Search className="h-4 w-4" />}
            debounce={300}
            className="flex-1"
          />
          <TabSwitcher<ViewType>
            activeTab={viewType}
            onTabChange={handleTabChange}
            tabs={tabs}
          />
        </div>

        {/* Rankings table */}
        <RatingsTable
          type={viewType}
          data={currentData}
          isLoading={isLoading}
          startRank={startRank}
        />

        {/* Pagination */}
        {!isLoading && currentData.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={currentData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </main>
  );
}
