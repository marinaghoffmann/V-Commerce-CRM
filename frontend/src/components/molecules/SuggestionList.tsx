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
      <div className="w-full max-w-[520px] space-y-2.5 px-1">
        {suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => onSelectSuggestion(suggestion)}
            className="w-full text-left px-4 py-2.5 bg-[#EAF1FF] border border-[#CFE0FF] rounded-2xl hover:bg-[#DFEAFF] hover:border-[#B8D1FF] transition text-[15px] text-gray-700 cursor-pointer flex items-start gap-3 font-medium shadow-sm"
          >
            <AssistenteIcon className="w-[17px] h-[17px] text-gray-500 fill-current flex-shrink-0 mt-0.5" />
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
