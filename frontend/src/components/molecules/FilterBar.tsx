import { SearchInput } from "../atoms/SearchInput";

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchField: string;
  onSearchFieldChange: (field: string) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  filters: string[];
}

export const FilterBar = ({
  search,
  onSearchChange,
  searchField,
  onSearchFieldChange,
  activeFilter,
  onFilterChange,
  filters,
}: FilterBarProps) => {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white w-[96vw] mx-auto">
      <select
        value={searchField}
        onChange={(e) => onSearchFieldChange(e.target.value)}
        className="p-1.5 border rounded-lg text-sm text-gray-600 outline-none cursor-pointer"
      >
        <option value="nome_cliente">Cliente</option>
        <option value="nome_produto">Produto</option>
        <option value="categoria_produto">Categoria</option>
        <option value="status">Status</option>
        <option value="metodo_pagamento">Método de Pagamento</option>
      </select>

      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder={`Buscar por ${searchField}...`}
      />
    </div>
  );
};