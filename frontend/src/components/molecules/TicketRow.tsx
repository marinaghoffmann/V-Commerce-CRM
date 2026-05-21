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
    if (months < 12) return `há ${months} mês${months > 1 ? "es" : ""}`;
    const years = Math.floor(days / 365);
    return `há ${years} ano${years > 1 ? "s" : ""}`;
  } catch {
    return dateStr;
  }
}

export function TicketRow({ ticket }: TicketRowProps) {
  return (
    <div
      className="flex items-center justify-between py-4 px-4 gap-4 hover:bg-blue-50/50 transition-colors rounded-xl"
    >
      {/* Coluna esquerda */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 mb-1 font-mono flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full shrink-0 ${ticket.status_ticket === "fechado" ? "bg-green-500" : "bg-red-500"}`} />
          T-{ticket.id_ticket.slice(0, 4).toUpperCase()} · {ticket.nome_cliente ?? "Cliente"}
        </p>
        <p className="text-sm font-semibold text-[#1B2559] truncate mb-2">
          {ticket.tipo_problema ? ticket.tipo_problema.charAt(0).toUpperCase() + ticket.tipo_problema.slice(1) : "Sem descrição"}
        </p>
        <StatusBadge status={ticket.status_ticket} />
      </div>

      {/* Coluna direita */}
      <div className="shrink-0 text-right">
        <p className="text-xs text-gray-400 whitespace-nowrap">
          {formatRelative(ticket.data_abertura)}
        </p>
      </div>
    </div>
  );
}