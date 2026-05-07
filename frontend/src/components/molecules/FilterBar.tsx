import { SearchInput } from "../atoms/SearchInput";
import { FilterChip } from "../atoms/FilterChip";

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  filters: string[];
}

export const FilterBar = ({
  search,
  onSearchChange,
  activeFilter,
  onFilterChange,
  filters,
}: FilterBarProps) => {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar por nome ou email..."
      />

      <div className="flex items-center gap-2">
        {filters.map((filter) => (
          <FilterChip
            key={filter}
            label={filter}
            active={activeFilter === filter}
            onClick={() => onFilterChange(filter)}
          />
        ))}
      </div>
    </div>
  );
};