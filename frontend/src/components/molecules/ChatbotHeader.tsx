import { X } from "lucide-react";
import AssistenteIcon from "../../assets/navbar_icons/AssistenteIcon.svg?react";

interface ChatbotHeaderProps {
  onClose: () => void;
}

export function ChatbotHeader({ onClose }: ChatbotHeaderProps) {
  return (
    <div className="bg-white px-6 py-4 rounded-t-xl flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center">
            <AssistenteIcon className="w-5 h-5 text-current fill-current" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-800 text-base">Agente V-commerce</h2>
            <p className="text-gray-500 text-xs">Pergunte em linguagem natural</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 transition cursor-pointer border border-gray-200 hover:border-gray-300 rounded-md"
          aria-label="Fechar assistente"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
