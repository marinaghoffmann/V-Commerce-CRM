import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Ticket, CheckCircle } from "lucide-react";
import { Navbar } from "../organisms/Navbar";
import { PageHeader } from "../molecules/TitleHeaeder";
import { KpiCard } from "../atoms/KpiCard";
import { TicketRow } from "../molecules/TicketRow";
import { useTickets } from "../../hooks/useTickets";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

const STATUS_FILTERS = ["Todos", "aberto", "fechado"];

const FILTER_LABELS: Record<string, string> = {
  Todos: "Todos",
  aberto: "Aberto",
  fechado: "Fechado",
};

export default function SuportePage() {
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [kpis, setKpis] = useState<Record<string, number | string>>({});

  const { data: tickets, total, loading, error, page, setPage, limit, refetch } =
    useTickets({ page: 1, limit: 7 });

  useEffect(() => {
    fetch(`${BASE_URL}/ticket/kpis/resumo`)
      .then((r) => r.json())
      .then(setKpis)
      .catch(() => {});
  }, []);

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
    <div className="min-h-screen bg-slate-50 p-4">
      <Navbar />

      <div className="mx-auto w-full max-w-screen-xl px-6">
        <PageHeader title="Suporte" subtitle="Acompanhe o andamento do canal de suporte" />

        {/* KPI Cards */}
        <div className="flex gap-4 mb-6">
          <KpiCard
            iconBg="bg-red-100"
            icon={<Ticket className="text-red-500" size={22} />}
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
        <div className="flex items-center gap-3 mb-4">
          <div className="flex gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={[
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150",
                  activeFilter === f
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-gray-500 border border-gray-200 hover:border-blue-300 hover:text-blue-600",
                ].join(" ")}
              >
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de tickets */}
        <div className="flex flex-col gap-2">
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
          {!loading &&
            tickets.map((ticket) => (
              <TicketRow key={ticket.id_ticket} ticket={ticket} />
            ))}
        </div>

        {/* Paginação */}
        {!loading && tickets.length > 0 && (
          <div className="mt-4 flex items-center justify-between rounded-xl border-t border-gray-100 bg-white px-5 py-3">
            <span className="text-xs text-gray-400">
              Mostrando {String(from).padStart(2, "0")} a {String(to).padStart(2, "0")}
              {total > 0 ? ` de ${total} resultados` : ""}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={[
                    "flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium transition-colors",
                    page === n
                      ? "bg-blue-600 text-white"
                      : "text-gray-500 hover:bg-gray-100",
                  ].join(" ")}
                >
                  {n}
                </button>
              ))}

              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}