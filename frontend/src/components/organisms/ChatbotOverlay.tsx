import { useState, useRef, useEffect, useCallback } from "react";
import { useChatbot } from "../../contexts/ChatbotContext";
import { ChatbotHeader } from "../molecules/ChatbotHeader";
import { ChatbotInput } from "../molecules/ChatbotInput";
import { EmptyState } from "../molecules/EmptyState";
import { BotMessage } from "../molecules/BotMessage";
import { UserMessage } from "../molecules/UserMessage";
import { TypingIndicator } from "../atoms/TypingIndicator";

const WINDOW_W = 400;
const WINDOW_H = 560;
const MARGIN   = 12;

interface ChatbotOverlayProps {
  onClose: () => void;
  buttonPos: { x: number; y: number };
  buttonSize?: number;
}

export function ChatbotOverlay({
  onClose,
  buttonPos,
  buttonSize = 56,
}: ChatbotOverlayProps) {
  const { messages, loading, sendMessage, suggestions } = useChatbot();
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef       = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const calcInitialPos = useCallback(() => {
    let x = buttonPos.x + buttonSize - WINDOW_W;
    let y = buttonPos.y - WINDOW_H - MARGIN;

    if (y < 8)                                 y = buttonPos.y + buttonSize + MARGIN;
    if (x < 8)                                 x = 8;
    if (x + WINDOW_W > window.innerWidth  - 8) x = window.innerWidth  - WINDOW_W - 8;
    if (y + WINDOW_H > window.innerHeight - 8) y = window.innerHeight - WINDOW_H - 8;

    return { x, y };
  }, []); 

  const [pos, setPos] = useState(calcInitialPos);

  const isDragging   = useRef(false);
  const startPointer = useRef({ x: 0, y: 0 });
  const startPos     = useRef({ x: 0, y: 0 });

  const clampWindow = useCallback((x: number, y: number) => ({
    x: Math.min(Math.max(x, 0), window.innerWidth  - WINDOW_W),
    y: Math.min(Math.max(y, 0), window.innerHeight - WINDOW_H),
  }), []);

  const onHeaderPointerDown = useCallback(
    (clientX: number, clientY: number) => {
      isDragging.current   = true;
      startPointer.current = { x: clientX, y: clientY };
      startPos.current     = { ...pos };
    },
    [pos]
  );

  const onPointerMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging.current) return;
      const dx = clientX - startPointer.current.x;
      const dy = clientY - startPointer.current.y;
      setPos(clampWindow(startPos.current.x + dx, startPos.current.y + dy));
    },
    [clampWindow]
  );

  const onPointerUp = useCallback(() => { isDragging.current = false; }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => onPointerMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup",   onPointerUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend",  onPointerUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup",   onPointerUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend",  onPointerUp);
    };
  }, [onPointerMove, onPointerUp]);

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
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsOpen(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={`fixed z-[9998] flex h-[560px] w-[400px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-all duration-200 ease-out ${
        isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-95 opacity-0"
      }`}
      style={{ left: pos.x, top: pos.y }}
    >
        {/* Cabeçalho arrastável */}
        <div
          className="cursor-grab select-none"
          onMouseDown={(e) => {
            if ((e.target as HTMLElement).closest("button")) return;
            e.preventDefault();
            onHeaderPointerDown(e.clientX, e.clientY);
          }}
          onTouchStart={(e) => {
            if ((e.target as HTMLElement).closest("button")) return;
            onHeaderPointerDown(e.touches[0].clientX, e.touches[0].clientY);
          }}
        >
          <ChatbotHeader onClose={onClose} />
        </div>

        {/* Área de mensagens */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 bg-white"
        >
          {!hasMessages ? (
            <EmptyState suggestions={suggestions} onSelectSuggestion={handleSendSuggestion} />
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
                      error={msg.error}
                      errorType={msg.errorType}
                      sourceTables={msg.sourceTables}
                    />
                  )}
                </div>
              ))}
              {loading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Rodapé */}
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