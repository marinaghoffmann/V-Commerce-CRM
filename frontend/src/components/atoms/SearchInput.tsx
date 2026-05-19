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
    <div className="relative w-full">
      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-full bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm transition-all"
      />
    </div>
  );
};