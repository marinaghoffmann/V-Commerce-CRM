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
    <div className="bg-white p-4">
      <div className="flex border border-gray-300 rounded-xl overflow-hidden items-center pr-2 pl-4 py-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder="Pergunte sobre vendas, clientes, suporte, etc..."
          disabled={disabled}
          className="flex-1 focus:outline-none text-gray-700 text-sm bg-transparent"
        />
        <button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white p-1.5 rounded-lg transition flex items-center justify-center disabled:cursor-not-allowed cursor-pointer ml-3"
          aria-label="Enviar mensagem"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
