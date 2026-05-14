import { SearchInput } from "../atoms/SearchInput";

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchField: string;
  onSearchFieldChange: (field: string) => void;
}

export const FilterBar = ({
  search,
  onSearchChange,
  searchField,
  onSearchFieldChange,
}: FilterBarProps) => {
  return (
    <div className="flex gap-3">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder={`Buscar por ${(searchField.replace('nome_', '')).replace('_', ' ')}...`}
      />

      <select
        value={searchField}
        onChange={(e) => onSearchFieldChange(e.target.value)}
        className="border border-gray-200 rounded-full px-5 py-2.5 bg-white text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer shadow-sm transition-all"
      >
        <option value="nome_cliente">Cliente</option>
        <option value="nome_produto">Produto</option>
        <option value="categoria_produto">Categoria</option>
        <option value="status">Status</option>
        <option value="metodo_pagamento">Método de Pagamento</option>
      </select>
    </div>
  );
};