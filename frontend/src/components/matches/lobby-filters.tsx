import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LobbyFiltersProps {
  matchTypeFilter: string;
  onMatchTypeChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  rankedFilter: boolean;
  onRankedChange: (checked: boolean) => void;
}

export function LobbyFilters({
  matchTypeFilter,
  onMatchTypeChange,
  statusFilter,
  onStatusChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  rankedFilter,
  onRankedChange,
}: LobbyFiltersProps) {
  return (
    <div className="space-y-4 mb-6">
      <p className="text-sm text-muted-foreground">
        Filtruj gry po typie (Dobierane/Zespołowe), statusie (Zaplanowana/W
        trakcie), czasie rozgrywki oraz rankingu
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={matchTypeFilter} onValueChange={onMatchTypeChange}>
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="Typ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie typy</SelectItem>
            <SelectItem value="Queue">Dobierane</SelectItem>
            <SelectItem value="Team">Zespołowe</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie statusy</SelectItem>
            <SelectItem value="SCHEDULED">Zaplanowane</SelectItem>
            <SelectItem value="ONGOING">W trakcie</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2 items-center">
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground"
          />
          <span className="text-muted-foreground">-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground"
          />
        </div>

        <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-md h-9">
          <Checkbox
            id="ranked"
            checked={rankedFilter}
            onCheckedChange={(checked) => onRankedChange(checked === true)}
          />
          <label
            htmlFor="ranked"
            className="text-sm font-medium cursor-pointer"
          >
            Tylko Ranked
          </label>
        </div>
      </div>
    </div>
  );
}
