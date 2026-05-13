import { SuggestionList } from "./SuggestionList";
import AssistenteIcon from "../../assets/navbar_icons/AssistenteIcon.svg?react";

interface EmptyStateProps {
  suggestions: string[];
  onSelectSuggestion: (suggestion: string) => void;
}

export function EmptyState({
  suggestions,
  onSelectSuggestion,
}: EmptyStateProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center -mt-6">
      <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center mb-6">
        <AssistenteIcon className="w-8 h-8 text-current fill-current" />
      </div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Como posso ajudar?</h2>
        <p className="text-gray-600 text-sm mb-2">
          Faça perguntas sobre clientes, pedidos e operações.
        </p>
      </div>
      <div className="w-full max-w-2xl mt-4">
        <SuggestionList
          suggestions={suggestions}
          onSelectSuggestion={onSelectSuggestion}
        />
      </div>
    </div>
  );
}
