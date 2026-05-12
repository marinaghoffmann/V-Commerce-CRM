import { X } from "lucide-react";

interface ChatbotHeaderProps {
  onClose: () => void;
}

export function ChatbotHeader({ onClose }: ChatbotHeaderProps) {
  return (
    <div className="bg-blue-500 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
          <span className="text-blue-500 text-lg">✨</span>
        </div>
        <h2 className="font-semibold text-base">Como posso ajudar?</h2>
      </div>
      <button
        onClick={onClose}
        className="text-white hover:bg-blue-600 rounded-full p-1 transition cursor-pointer"
        aria-label="Fechar assistente"
      >
        <X size={20} />
      </button>
    </div>
  );
}
