import { ReactNode } from "react";

interface ChatBubbleProps {
  type: "user" | "bot";
  children: ReactNode;
}

export function ChatBubble({ type, children }: ChatBubbleProps) {
  return (
    <div
      className={`rounded-lg ${
        type === "user"
          ? "bg-blue-500 text-white rounded-br-none max-w-xs px-4 py-2"
          : "bg-gray-200 text-gray-800 rounded-bl-none px-3 py-3 min-w-[320px] max-w-[50%]"
      }`}
    >
      {children}
    </div>
  );
}
