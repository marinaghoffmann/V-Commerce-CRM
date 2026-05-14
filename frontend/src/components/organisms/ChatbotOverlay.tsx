import { useState, useRef, useEffect } from "react";
import { useAIChat } from "../../hooks/useAIChat";
import { ChatbotHeader } from "../molecules/ChatbotHeader";
import { ChatbotInput } from "../molecules/ChatbotInput";
import { EmptyState } from "../molecules/EmptyState";
import { BotMessage } from "../molecules/BotMessage";
import { UserMessage } from "../molecules/UserMessage";
import { TypingIndicator } from "../atoms/TypingIndicator";

interface ChatbotOverlayProps {
  onClose: () => void;
}

export function ChatbotOverlay({ onClose }: ChatbotOverlayProps) {
  const { messages, loading, sendMessage, suggestions } = useAIChat();
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      await sendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleSendSuggestion = async (suggestion: string) => {
    await sendMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="fixed top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-4xl h-[75vh] bg-white rounded-xl shadow-2xl flex flex-col z-50">
      <ChatbotHeader onClose={onClose} />

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 bg-white"
      >
        {!hasMessages ? (
          <EmptyState
            suggestions={suggestions}
            onSelectSuggestion={handleSendSuggestion}
          />
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div key={idx}>
                {msg.type === "user" ? (
                  <UserMessage content={msg.content} />
                ) : (
                  <BotMessage
                    content={msg.content}
                    rows={msg.rows}
                    sql={msg.sql}
                    isValid={msg.isValid}
                  />
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <ChatbotInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSendMessage}
        onKeyPress={handleKeyPress}
        disabled={loading}
      />
    </div>
  );
}
