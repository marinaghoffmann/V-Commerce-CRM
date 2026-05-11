import type { Ticket } from "../types/ticket.types";
import { StatusBadge } from "../atoms/StatusBadge";

interface TicketRowProps {
  ticket: Ticket;
}

function formatRelative(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / 3_600_000);
    if (hours < 1) return "agora há pouco";
    if (hours < 24) return `há ${hours} hora${hours > 1 ? "s" : ""}`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `há ${days} dia${days > 1 ? "s" : ""}`;
    const months = Math.floor(days / 30);
    return `há ${months} mês${months > 1 ? "es" : ""}`;
  } catch {
    return dateStr;
  }
}

export function TicketRow({ ticket }: TicketRowProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white px-5 py-4 shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-150">
      {/* Info principal */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 mb-0.5">
          #{ticket.id_ticket} · {ticket.nome_cliente ?? "Cliente"}
        </p>
        <p className="text-sm font-semibold text-gray-800 truncate">
          {ticket.tipo_problema ?? "Sem descrição"}
        </p>
        {ticket.nome_produto && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            Produto: {ticket.nome_produto}
          </p>
        )}
      </div>

      {/* Badge status */}
      <div className="shrink-0">
        <StatusBadge status={ticket.status_ticket} />
      </div>

      {/* Tempo */}
      <div className="shrink-0 text-right">
        <p className="text-xs text-gray-400 whitespace-nowrap">
          {formatRelative(ticket.data_abertura)}
        </p>
        {ticket.agente_suporte && (
          <p className="text-xs text-gray-300 mt-0.5">{ticket.agente_suporte}</p>
        )}
      </div>
    </div>
  );
}