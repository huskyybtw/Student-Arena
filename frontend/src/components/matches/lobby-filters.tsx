import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-range-picker";

interface LobbyFiltersProps {
  matchTypeFilter: string;
  onMatchTypeChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  startDate: Date | undefined;
  onStartDateChange: (value: Date | undefined) => void;
  endDate: Date | undefined;
  onEndDateChange: (value: Date | undefined) => void;
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
          <DatePicker
            date={startDate}
            onDateChange={onStartDateChange}
            placeholder="Data od"
          />
          <span className="text-muted-foreground">-</span>
          <DatePicker
            date={endDate}
            onDateChange={onEndDateChange}
            placeholder="Data do"
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
