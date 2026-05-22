import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useChatbotSession } from "../hooks/useChatbotSession";
import { getInitialSuggestionsForPage } from "./chatbot.utils";
import type { ChatPoint, ChatbotContextType } from "./chatbot.types";

export type { ChatMessage, UseAIChatReturn } from "./chatbot.types";

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export function ChatbotProvider({ children }: { children: ReactNode }) {
  const chatSession = useChatbotSession();
  const [isOpen, setIsOpen] = useState(false);
  const [buttonPos, setButtonPos] = useState<ChatPoint>(() => ({
    x: window.innerWidth - 80,
    y: window.innerHeight - 80,
  }));

  const openOverlay = useCallback((pos: ChatPoint) => {
    setButtonPos(pos);
    setIsOpen(true);
  }, []);

  const closeOverlay = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleOverlay = useCallback(
    (pos?: ChatPoint) => {
      if (isOpen) {
        setIsOpen(false);
        return;
      }

      if (pos) {
        setButtonPos(pos);
      }

      setIsOpen(true);
    },
    [isOpen],
  );

  // Derive page-specific initial suggestions when the chat is empty.
  const location = useLocation();
  const routePath = location.pathname;

  const derivedSuggestions = chatSession.messages.length === 0
    ? getInitialSuggestionsForPage(routePath)
    : chatSession.suggestions;

  const contextValue: ChatbotContextType = {
    isOpen,
    buttonPos,
    toggleOverlay,
    openOverlay,
    closeOverlay,
    ...chatSession,
    suggestions: derivedSuggestions,
  };

  return <ChatbotContext.Provider value={contextValue}>{children}</ChatbotContext.Provider>;
}

export function useChatbot() {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error("useChatbot must be used within ChatbotProvider");
  }
  return context;
}
