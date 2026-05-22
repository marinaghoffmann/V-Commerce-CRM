import { X } from "lucide-react";

interface ChatbotHeaderProps {
  onClose: () => void;
  onClear: () => void;
}

export function ChatbotHeader({ onClose, onClear }: ChatbotHeaderProps) {
  return (
    <div className="bg-white px-5 py-3.5 rounded-t-2xl flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h2 className="font-semibold text-gray-800 text-[15px] leading-5">Agente V-commerce</h2>
          <p className="text-gray-500 text-xs leading-4">Pergunte em linguagem natural</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2563EB] cursor-pointer shadow-sm"
            aria-label="Limpar conversa"
          >
            Limpar conversa
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 p-2 text-gray-400 transition cursor-pointer hover:border-gray-300 hover:text-gray-600"
            aria-label="Fechar assistente"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
