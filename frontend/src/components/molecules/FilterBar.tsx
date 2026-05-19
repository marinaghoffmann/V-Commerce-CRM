import { SearchInput } from "../atoms/SearchInput";
import { DropdownFilter } from "../atoms/DropdownFilter";
import { PeriodoFilter } from "../atoms/PeriodoFilter";
import type { PeriodoSelecionado } from "../atoms/PeriodoFilter";

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  periodoOptions: PeriodoSelecionado[];
  selectedPeriodo: PeriodoSelecionado[];
  onPeriodoChange: (v: PeriodoSelecionado[]) => void;
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
  periodoOptions,
  selectedPeriodo,
  onPeriodoChange,
  categoriaOptions,
  selectedCategoria,
  onCategoriaChange,
  statusOptions,
  selectedStatus,
  onStatusChange,
}: FilterBarProps) => {
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 min-w-0">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Pesquisar pelo nome do cliente ou produto"
        />
      </div>

      <PeriodoFilter
        options={periodoOptions}
        selected={selectedPeriodo}
        onChange={onPeriodoChange}
      />

      <DropdownFilter
        label="Categoria"
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