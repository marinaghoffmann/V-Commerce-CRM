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
    <div className="h-full flex flex-col items-center justify-center px-3">
      <div className="w-12 h-12 bg-[#3B82F6] text-white rounded-full flex items-center justify-center mb-4 shadow-sm">
        <AssistenteIcon className="w-6 h-6 text-current fill-current" />
      </div>
      <div className="text-center mb-5 max-w-xl">
        <h2 className="text-[22px] leading-tight font-semibold text-gray-800 mb-1 tracking-tight">
          Como posso ajudar?
        </h2>
        <p className="text-gray-600 text-[14px] leading-5 mb-1">
          Faça perguntas sobre clientes, pedidos e operações.
        </p>
      </div>
      <div className="w-full max-w-2xl">
        <SuggestionList
          suggestions={suggestions}
          onSelectSuggestion={onSelectSuggestion}
        />
      </div>
    </div>
  );
}
