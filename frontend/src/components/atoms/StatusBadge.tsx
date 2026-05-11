import type { TicketStatus } from "../types/ticket.types";

interface StatusBadgeProps {
  status: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  aberto: "bg-red-100 text-red-600 border border-red-200",
  fechado: "bg-green-100 text-green-600 border border-green-200",
};

const STATUS_LABEL: Record<string, string> = {
  aberto: "Aberto",
  fechado: "Fechado",
};

export function StatusBadge({ status }: { status: string | null }) {
  const key = status?.toLowerCase() ?? "";
  const style = STATUS_STYLES[key] ?? "bg-gray-100 text-gray-500 border border-gray-200";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${style}`}>
      {STATUS_LABEL[key] ?? status ?? "—"}
    </span>
  );
}