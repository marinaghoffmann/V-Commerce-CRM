import { createContext, useContext, useState, ReactNode } from "react";
import { ChatbotOverlay } from "../components/organisms/ChatbotOverlay";

interface ChatbotContextType {
  isOpen: boolean;
  toggleOverlay: () => void;
  openOverlay: () => void;
  closeOverlay: () => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export function ChatbotProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOverlay = () => setIsOpen((prev) => !prev);
  const openOverlay = () => setIsOpen(true);
  const closeOverlay = () => setIsOpen(false);

  return (
    <ChatbotContext.Provider value={{ isOpen, toggleOverlay, openOverlay, closeOverlay }}>
      {children}
      {isOpen && <ChatbotOverlay onClose={closeOverlay} />}
    </ChatbotContext.Provider>
  );
}

export function useChatbot() {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error("useChatbot must be used within ChatbotProvider");
  }
  return context;
}
