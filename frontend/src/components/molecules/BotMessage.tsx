import { AlertTriangle, Database } from "lucide-react";
import { SQLQueryBox } from "../atoms/SQLQueryBox";
import { ResultsTable } from "./ResultsTable";
import AssistenteIcon from "../../assets/navbar_icons/AssistenteIcon.svg?react";

interface BotMessageProps {
  content: string;
  rows?: unknown[];
  sql?: string;
  isValid?: boolean;
  sourceTables?: string[];
  error?: string;
}

function resolveErrorLabel(error: string): string {
  const text = error.toLowerCase();

  if (text.includes("operação não permitida") || text.includes("operacao nao permitida"))
    return "Operação não permitida";
  if (text.includes("fora do escopo") || text.includes("fora desse escopo") || text.includes("fora de escopo"))
    return "Fora do escopo";
  if (text.includes("ambígua") || text.includes("ambigua"))
    return "Pergunta ambígua";
  if (text.includes("entidade") || text.includes("não está nos dados") || text.includes("nao esta nos dados"))
    return "Entidade desconhecida";
  if (text.includes("erro ao executar") || text.includes("erro de sql"))
    return "Erro de execução";

  return "Erro";
}

export function BotMessage({ content, rows, sql, isValid, sourceTables, error }: BotMessageProps) {
  const isError = isValid === false;

  const sourceLabel =
    sourceTables && sourceTables.length > 0 ? sourceTables.join(", ") : null;

  const errorLabel = resolveErrorLabel(error ?? content);

  // Corpo: remove o prefixo "Erro: " para não duplicar
  const errorBody = content.replace(/^erro:\s*/i, "").trim();

  return (
    <div className="flex justify-start items-start gap-2">
      {/* Avatar */}
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

      {/* Balão */}
      {isError ? (
        <div className="max-w-[85%] flex flex-col gap-2 bg-amber-50 border border-amber-300 rounded-xl px-3.5 py-3">
          <span className="inline-flex items-center gap-1 self-start bg-amber-600 text-white text-[11px] font-bold rounded-md px-2 py-0.5 tracking-wide">
            <AlertTriangle size={11} />
            {errorLabel}
          </span>
          <p className="text-sm text-amber-900 leading-relaxed">
            {errorBody}
          </p>
        </div>
      ) : (
        <div className="max-w-[85%] flex flex-col gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-3">
          <p className="text-sm text-blue-900 leading-relaxed break-words">{content}</p>

          {rows && rows.length > 0 && <ResultsTable rows={rows} />}

          {sql && isValid && rows && rows.length > 0 && <SQLQueryBox query={sql} />}

          {sourceLabel && rows && rows.length > 0 && (
            <span className="inline-flex items-center gap-1 self-start bg-blue-100 text-blue-800 text-[11px] font-semibold rounded-md px-2 py-0.5">
              <Database size={10} />
              Fonte: {sourceLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}