import { useCallback, useEffect, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export interface ChatMessage {
  type: "user" | "bot" | "suggestion";
  content: string;
  timestamp: number;
  sql?: string;
  isValid?: boolean;
  rows?: unknown[];
  error?: string;
}

interface UseAIChatReturn {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sessionId: string;
  sendMessage: (question: string) => Promise<void>;
  clearMessages: () => void;
  suggestions: string[];
}

const INITIAL_SUGGESTIONS = [
  "Quais clientes geraram mais receita este ano?",
  "Mostre o top 10 produtos mais vendidos.",
  "Qual o produto com maior ticket médio?",
  "Mostre os top 10 produtos com mais tickets, com a quantidade.",
];

export function useAIChat(): UseAIChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>("");

  // Initialize session ID on first mount
  useEffect(() => {
    const stored = sessionStorage.getItem("ai_chat_session_id");
    if (stored) {
      setSessionId(stored);
    } else {
      // Generate new UUID for this session
      const newSessionId = crypto.randomUUID();
      sessionStorage.setItem("ai_chat_session_id", newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  const sendMessage = useCallback(
    async (question: string) => {
      if (!sessionId || !question.trim()) return;

      // Add user message
      const userMessage: ChatMessage = {
        type: "user",
        content: question,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${BASE_URL}/agent/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: question,
            session_id: sessionId,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Add bot response message
        const botMessage: ChatMessage = {
          type: "bot",
          content: data.is_valid
            ? `Encontrei ${data.rows?.length || 0} resultados.`
            : `Erro: ${data.error_message || "Não consegui processar sua pergunta."}`,
          timestamp: Date.now(),
          sql: data.final_sql,
          isValid: data.is_valid,
          rows: data.rows,
          error: data.error_message,
        };

        setMessages((prev) => [...prev, botMessage]);
      } catch (err: any) {
        const errorMsg = err?.message ?? "Erro ao conectar com o servidor";
        setError(errorMsg);

        const errorMessage: ChatMessage = {
          type: "bot",
          content: `Erro: ${errorMsg}`,
          timestamp: Date.now(),
          error: errorMsg,
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setLoading(false);
      }
    },
    [sessionId]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    loading,
    error,
    sessionId,
    sendMessage,
    clearMessages,
    suggestions: INITIAL_SUGGESTIONS,
  };
}
