interface FilterChipProps {
  label: string;
  active?: boolean;
  onClick: () => void;
}

export const FilterChip = ({ label, active = false, onClick }: FilterChipProps) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
        active
          ? "bg-blue-600 text-white"
          : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700"
      }`}
    >
      {label}
    </button>
  );
};