import { ChatBubble } from "../atoms/ChatBubble";
import { SQLQueryBox } from "../atoms/SQLQueryBox";
import { ResultsTable } from "./ResultsTable";
import AssistenteIcon from "../../assets/navbar_icons/AssistenteIcon.svg?react";

interface BotMessageProps {
  content: string;
  rows?: unknown[];
  sql?: string;
  isValid?: boolean;
}

export function BotMessage({ content, rows, sql, isValid }: BotMessageProps) {
  return (
    <div className="flex justify-start">
      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex flex-shrink-0 items-center justify-center mr-2">
        <AssistenteIcon className="w-[18px] h-[18px] text-current fill-current" />
      </div>
      <ChatBubble type="bot">
        <div className="flex flex-col gap-2">
          {/* Seção 1: Mensagem */}
          <p className="text-sm break-words">{content}</p>

          {/* Seção 2: Tabela */}
          {rows && rows.length > 0 && <ResultsTable rows={rows} />}

          {/* Seção 3: SQL */}
          {sql && isValid && rows && rows.length > 0 && (
            <SQLQueryBox query={sql} />
          )}
        </div>
      </ChatBubble>
    </div>
  );
}
