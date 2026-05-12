import { ChatBubble } from "../atoms/ChatBubble";

interface UserMessageProps {
  content: string;
}

export function UserMessage({ content }: UserMessageProps) {
  return (
    <div className="flex justify-end">
      <ChatBubble type="user">
        <p className="text-sm break-words">{content}</p>
      </ChatBubble>
    </div>
  );
}
