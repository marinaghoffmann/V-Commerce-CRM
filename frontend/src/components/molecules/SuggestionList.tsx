import AssistenteIcon from "../../assets/navbar_icons/AssistenteIcon.svg?react";

interface SuggestionListProps {
  suggestions: string[];
  onSelectSuggestion: (suggestion: string) => void;
}

export function SuggestionList({
  suggestions,
  onSelectSuggestion,
}: SuggestionListProps) {
  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-xl space-y-3 px-2">
        {suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => onSelectSuggestion(suggestion)}
            className="w-full text-left px-4 py-3 bg-gray-50 border border-transparent rounded-xl hover:bg-gray-100 hover:border-gray-200 transition text-sm text-gray-700 cursor-pointer flex items-center gap-3 font-medium"
          >
            <AssistenteIcon className="w-[18px] h-[18px] text-gray-500 fill-current flex-shrink-0" />
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
