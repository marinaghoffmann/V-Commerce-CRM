import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, TicketX, CheckCircle } from "lucide-react";
import { TicketRow } from "../molecules/TicketRow";
import { useTickets } from "../../hooks/useTickets";

const STATUS_FILTERS = ["Todos", "aberto", "fechado"];

const FILTER_LABELS: Record<string, string> = {
  Todos: "Todos",
  aberto: "Aberto",
  fechado: "Fechado",
};

interface KpiCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number | string;
}

function KpiCard({ icon, iconBg, label, value }: KpiCardProps) {
  return (
    <div className="flex-1 bg-white rounded-2xl border border-[#E2E8F0] px-6 py-5 flex items-center gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-[#1B2559]">{value}</p>
        <p className="text-sm text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function SuportePage() {
  const [activeFilter, setActiveFilter] = useState("Todos");

  const { data: tickets, total, loading, error, page, setPage, limit, refetch, kpis } =
    useTickets({ page: 1, limit: 7 });

  useEffect(() => {
    refetch({ page, status: activeFilter });
  }, [page, activeFilter]); // eslint-disable-line

  const handleFilterChange = (f: string) => {
    setActiveFilter(f);
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit) || 1;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total || tickets.length);

  return (
    <div className="min-h-screen bg-[#F4F7FE] px-6 pb-6">
      <div className="mx-auto w-full max-w-screen-xl px-8 pt-2 pb-8">
        {/* Card container principal */}

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-black">Suporte</h1>
          <p className="text-sm text-gray-400 mt-1">Acompanhe o andamento do canal de suporte</p>
        </div>

        {/* KPI Cards */}
        <div className="flex gap-4 mb-8">
          <KpiCard
            iconBg="bg-red-100"
            icon={<TicketX className="text-red-500" size={22} />}
            label="Tickets em aberto"
            value={kpis["aberto"] ?? 0}
          />
          <KpiCard
            iconBg="bg-green-100"
            icon={<CheckCircle className="text-green-500" size={22} />}
            label={`Fechados em ${kpis["fechado_mes_ref"] ?? "—"}`}
            value={kpis["fechado_mes"] ?? 0}
          />
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2 mb-6 bg-[#F4F7FE] rounded-xl p-1.5 w-fit">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className={[
                "rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-150",
                activeFilter === f
                  ? "bg-blue-100 text-blue-600 shadow-sm"
                  : "text-gray-400 hover:text-gray-600",
              ].join(" ")}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>

        {/* Lista de tickets */}
        <div className="flex flex-col divide-y divide-[#E2E8F0]">
          {loading && (
            <div className="py-10 text-center text-sm text-gray-400">Carregando tickets...</div>
          )}
          {error && (
            <div className="py-10 text-center text-sm text-red-400">
              Erro ao carregar tickets: {error}
            </div>
          )}
          {!loading && !error && tickets.length === 0 && (
            <div className="py-10 text-center text-sm text-gray-400">Nenhum ticket encontrado.</div>
          )}
          {!loading && tickets.map((ticket) => (
            <TicketRow key={ticket.id_ticket} ticket={ticket} />
          ))}
        </div>

        {/* Paginação */}
        {!loading && tickets.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Mostrando {String(from).padStart(2, "0")} a {String(to).padStart(2, "0")}
              {total > 0 ? ` de ${total} resultados` : ""}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft size={15} />
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                return start + i;
              }).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={[
                    "w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium transition-colors",
                    page === n
                      ? "border-2 border-blue-500 text-blue-600 bg-white"
                      : "text-gray-400 hover:bg-gray-100",
                  ].join(" ")}
                >
                  {n}
                </button>
              ))}

              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}