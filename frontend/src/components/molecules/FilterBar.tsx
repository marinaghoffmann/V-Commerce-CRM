import { SearchInput } from "../atoms/SearchInput";
import { DropdownFilter } from "../atoms/DropdownFilter";
import { DateRangeFilter } from "../organisms/DateRangeFilter";
import type { DateRange } from "../organisms/DateRangeFilter";

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  dateRange: DateRange;
  onDateRangeChange: (v: DateRange) => void;
  categoriaOptions: string[];
  selectedCategoria: string[];
  onCategoriaChange: (v: string[]) => void;
  statusOptions: string[];
  selectedStatus: string[];
  onStatusChange: (v: string[]) => void;
}

export const FilterBar = ({
  search,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  categoriaOptions,
  selectedCategoria,
  onCategoriaChange,
  statusOptions,
  selectedStatus,
  onStatusChange,
}: FilterBarProps) => {
  return (
    <div className="flex items-center gap-4 w-full">
      <div className="flex-1">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Pesquisar pelo nome do cliente ou produto"
        />
      </div>

      <DateRangeFilter
        selected={dateRange}
        onChange={onDateRangeChange}
      />

      <DropdownFilter
        label="Produto"
        options={categoriaOptions}
        selected={selectedCategoria}
        onChange={onCategoriaChange}
      />

      <DropdownFilter
        label="Status"
        options={statusOptions}
        selected={selectedStatus}
        onChange={onStatusChange}
      />
    </div>
  );
};