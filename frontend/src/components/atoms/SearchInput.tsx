// components/atoms/SearchInput.tsx
import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchInput = ({
  value,
  onChange,
  placeholder = "Buscar...",
}: SearchInputProps) => {
  return (
    <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-white focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
      <Search size={16} className="text-gray-400 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 text-sm text-gray-700 placeholder:text-gray-400 outline-none bg-transparent"
      />
    </div>
  );
};