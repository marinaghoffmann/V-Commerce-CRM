interface SuggestionListProps {
  suggestions: string[];
  onSelectSuggestion: (suggestion: string) => void;
}

export function SuggestionList({
  suggestions,
  onSelectSuggestion,
}: SuggestionListProps) {
  return (
    <div className="w-full space-y-3 px-2">
      <p className="text-xs text-gray-500 font-semibold px-2">SUGESTÕES</p>
      {suggestions.map((suggestion, idx) => (
        <button
          key={idx}
          onClick={() => onSelectSuggestion(suggestion)}
          className="w-full text-left px-3 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-blue-300 transition text-sm text-gray-700 cursor-pointer"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
