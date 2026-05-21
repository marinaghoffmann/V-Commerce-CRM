import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import api from "../services/api";
import {
  buildBotMessage,
  INITIAL_SUGGESTIONS,
  MAX_PERSISTED_MESSAGES,
  persistStoredChatState,
  readStoredChatState,
  SESSION_TTL_MS,
} from "../contexts/chatbot.utils";
import type { ChatMessage, StoredChatState } from "../contexts/chatbot.types";

function getErrorMessage(requestError: unknown) {
  if (axios.isAxiosError(requestError)) {
    return requestError.response?.data?.detail ?? requestError.message;
  }

  if (requestError instanceof Error) {
    return requestError.message;
  }

  return "Erro ao conectar com o servidor";
}

export function useChatbotSession() {
  const [initialChatState] = useState<StoredChatState>(readStoredChatState);
  const [sessionId, setSessionId] = useState(initialChatState.sessionId);
  const [expiresAt, setExpiresAt] = useState(initialChatState.expiresAt);
  const [messages, setMessages] = useState<ChatMessage[]>(initialChatState.messages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rotateSession = useCallback(() => {
    setSessionId(crypto.randomUUID());
    setExpiresAt(Date.now() + SESSION_TTL_MS);
    setMessages([]);
    setLoading(false);
    setError(null);
  }, []);

  const touchSession = useCallback(() => {
    setExpiresAt(Date.now() + SESSION_TTL_MS);
  }, []);

  useEffect(() => {
    if (expiresAt <= Date.now()) {
      rotateSession();
      return;
    }

    const timeout = window.setTimeout(() => {
      rotateSession();
    }, expiresAt - Date.now());

    return () => window.clearTimeout(timeout);
  }, [expiresAt, rotateSession]);

  useEffect(() => {
    persistStoredChatState({ sessionId, expiresAt, messages });
  }, [sessionId, expiresAt, messages]);

  const sendMessage = useCallback(
    async (question: string) => {
      const trimmedQuestion = question.trim();
      if (!trimmedQuestion || loading) return;

      const userMessage: ChatMessage = {
        type: "user",
        content: trimmedQuestion,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage].slice(-MAX_PERSISTED_MESSAGES));
      setLoading(true);
      setError(null);
      touchSession();

      try {
        const response = await api.post("/agent/chat", {
          question: trimmedQuestion,
          session_id: sessionId,
        });

        setMessages((prev) => [...prev, buildBotMessage(response.data)].slice(-MAX_PERSISTED_MESSAGES));
        touchSession();
      } catch (requestError: unknown) {
        const errorMessage = getErrorMessage(requestError);

        setError(errorMessage);

        const fallbackMessage: ChatMessage = {
          type: "bot",
          content: `Erro: ${errorMessage}`,
          timestamp: Date.now(),
          error: errorMessage,
        };

        setMessages((prev) => [...prev, fallbackMessage].slice(-MAX_PERSISTED_MESSAGES));
      } finally {
        setLoading(false);
      }
    },
    [loading, sessionId, touchSession],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    touchSession();
  }, [touchSession]);

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