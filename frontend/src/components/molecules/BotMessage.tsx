import { AlertTriangle } from "lucide-react";
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
  // isValid === false (ou undefined sem rows) → Estado 3: Fora do escopo
  const isError = isValid === false;

  return (
    <div className="flex justify-start items-start gap-2">
      {/* Avatar da IA */}
      <div
        className={`w-8 h-8 rounded-full flex flex-shrink-0 items-center justify-center ${
          isError ? "bg-amber-400" : "bg-blue-500"
        }`}
      >
        {isError ? (
          <AlertTriangle size={16} className="text-white" />
        ) : (
          <AssistenteIcon className="w-[18px] h-[18px] text-white fill-current" />
        )}
      </div>

      {/* Balão da mensagem */}
      {isError ? (
        /* ── Estado 3: Fora do escopo ─────────────────────────────────────── */
        <div
          style={{
            background  : "#fffbeb",
            border      : "1px solid #fbbf24",
            borderRadius: 12,
            padding     : "12px 14px",
            maxWidth    : "85%",
            display     : "flex",
            flexDirection: "column",
            gap         : 8,
          }}
        >
          {/* Badge "Fora do escopo" */}
          <span
            style={{
              display        : "inline-flex",
              alignItems     : "center",
              gap            : 4,
              backgroundColor: "#d97706",
              color          : "#ffffff",
              fontSize       : 11,
              fontWeight     : 700,
              borderRadius   : 6,
              padding        : "2px 8px",
              alignSelf      : "flex-start",
              letterSpacing  : "0.02em",
            }}
          >
            <AlertTriangle size={11} />
            Fora do escopo
          </span>

          {/* Texto educado */}
          <p className="text-sm text-amber-900 leading-relaxed">
            {content ||
              "Essa pergunta está fora da minha área de atuação. Sou especializado em dados do V-Commerce CRM — posso te ajudar com vendas, clientes, suporte e produtos."}
          </p>
        </div>
      ) : (
        /* ── Estado 2: Resposta padrão ────────────────────────────────────── */
        <div
          style={{
            background  : "#eff6ff",
            border      : "1px solid #bfdbfe",
            borderRadius: 12,
            padding     : "12px 14px",
            maxWidth    : "85%",
            display     : "flex",
            flexDirection: "column",
            gap         : 8,
          }}
        >
          {/* Conteúdo textual */}
          <p className="text-sm text-blue-900 leading-relaxed break-words">
            {content}
          </p>

          {/* Tabela de resultados (quando houver) */}
          {rows && rows.length > 0 && <ResultsTable rows={rows} />}

          {/* Caixa de SQL (opcional) */}
          {sql && isValid && rows && rows.length > 0 && (
            <SQLQueryBox query={sql} />
          )}

          {/* Badge "Fonte" */}
          {rows && rows.length > 0 && (
            <span
              style={{
                display        : "inline-flex",
                alignItems     : "center",
                backgroundColor: "#dbeafe",
                color          : "#1e40af",
                fontSize       : 11,
                fontWeight     : 600,
                borderRadius   : 6,
                padding        : "2px 8px",
                alignSelf      : "flex-start",
              }}
            >
              Fonte: Tickets de suporte — Mai/2026
            </span>
          )}
        </div>
      )}
    </div>
  );
}