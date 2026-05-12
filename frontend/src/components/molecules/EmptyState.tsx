import { SuggestionList } from "./SuggestionList";

interface EmptyStateProps {
  suggestions: string[];
  onSelectSuggestion: (suggestion: string) => void;
}

export function EmptyState({
  suggestions,
  onSelectSuggestion,
}: EmptyStateProps) {
  return (
    <div className="h-full flex flex-col items-center justify-start pt-6">
      <div className="text-center mb-6">
        <p className="text-gray-600 text-sm mb-2">
          Faça perguntas sobre seus clientes, pedidos e operações.
        </p>
      </div>
      <SuggestionList
        suggestions={suggestions}
        onSelectSuggestion={onSelectSuggestion}
      />
    </div>
  );
}
