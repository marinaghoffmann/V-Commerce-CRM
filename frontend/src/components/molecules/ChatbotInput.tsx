import { Send } from "lucide-react";

interface ChatbotInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export function ChatbotInput({
  value,
  onChange,
  onSend,
  onKeyPress,
  disabled = false,
}: ChatbotInputProps) {
  return (
    <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder="Faça uma pergunta..."
          disabled={disabled}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100"
        />
        <button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg transition flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
          aria-label="Enviar mensagem"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
