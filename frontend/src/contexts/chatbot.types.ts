export interface ChatMessage {
  type: "user" | "bot" | "suggestion";
  content: string;
  timestamp: number;
  sql?: string;
  isValid?: boolean;
  rows?: unknown[];
  error?: string;
  errorType?: string;
  sourceTables?: string[];
}

export interface UseAIChatReturn {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sessionId: string;
  sendMessage: (question: string) => Promise<void>;
  clearMessages: () => Promise<void>;
  suggestions: string[];
}

export type ChatPoint = { x: number; y: number };

export interface StoredChatState {
  sessionId: string;
  expiresAt: number;
  messages: ChatMessage[];
}

export interface ChatbotContextType extends UseAIChatReturn {
  isOpen: boolean;
  buttonPos: ChatPoint;
  toggleOverlay: (pos?: ChatPoint) => void;
  openOverlay: (pos: ChatPoint) => void;
  closeOverlay: () => void;
}

export interface ChatbotApiResponse {
  final_sql?: string;
  is_valid: boolean;
  rows?: unknown[];
  error_message?: string;
  error_type?: string;
}