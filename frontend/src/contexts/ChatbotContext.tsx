import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { useChatbotSession } from "../hooks/useChatbotSession";
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

  const contextValue: ChatbotContextType = {
    isOpen,
    buttonPos,
    toggleOverlay,
    openOverlay,
    closeOverlay,
    ...chatSession,
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
