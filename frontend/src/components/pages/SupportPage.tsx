import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  TicketX,
  CheckCircle,
  Search,
  ChevronDown,
  Check,
} from "lucide-react";
import { TicketRow } from "../molecules/TicketRow";
import { useTickets } from "../../hooks/useTickets";
import { TableSkeletonLoader } from "../molecules/TableSkeletonLoader";


const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  "produto":   { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700",   dot: "bg-blue-400"   },
  "entrega":   { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", dot: "bg-yellow-400" },
  "pagamento": { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700",  dot: "bg-green-400"  },
  "reembolso": { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700",    dot: "bg-red-400"    },
};

const CATEGORY_LABELS: Record<string, string> = {
  "produto":   "Produto",
  "entrega":   "Entrega",
  "pagamento": "Pagamento",
  "reembolso": "Reembolso",
};

function getCategoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-600", dot: "bg-gray-400" };
}

const STATUS_OPTIONS = ["aberto", "fechado"];
const CATEGORY_OPTIONS = ["produto", "entrega", "pagamento", "reembolso"];


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


const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  aberto:  { label: "Aberto",  dot: "bg-red-500",   badge: "bg-red-50 border-red-200 text-red-600"   },
  fechado: { label: "Fechado", dot: "bg-green-500", badge: "bg-green-50 border-green-200 text-green-600" },
};

interface StatusDropdownProps {
  selected: string[];
  onChange: (vals: string[]) => void;
}

function StatusDropdown({ selected, onChange }: StatusDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (val: string) =>
    onChange(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);

  const hasSelection = selected.length > 0;
  const displayLabel = hasSelection
    ? selected.length === 1
      ? STATUS_CONFIG[selected[0]]?.label
      : `Status (${selected.length})`
    : "Status";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={[
          "flex items-center justify-between gap-2 px-5 py-2 rounded-full text-sm border transition-all shadow-sm cursor-pointer w-44 h-10",
          open || hasSelection
            ? "bg-white border-blue-500 text-gray-800"
            : "bg-white border-gray-200 text-gray-600 hover:border-gray-300",
        ].join(" ")}
      >
        <span className="font-medium truncate">{displayLabel}</span>
        <ChevronDown size={16} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-44 bg-white rounded-2xl border border-gray-100 shadow-xl z-40 overflow-hidden py-2">
          <div className="flex flex-col gap-0.5 px-1">
            {STATUS_OPTIONS.map((val) => {
              const cfg = STATUS_CONFIG[val];
              const checked = selected.includes(val);
              return (
                <label
                  key={val}
                  className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors rounded-xl"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(val)}
                    className="sr-only"
                  />
                  {/* Checkbox customizado */}
                  <div
                    className={[
                      "w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 pointer-events-none",
                      checked ? "bg-blue-500 border-blue-500 text-white" : "border-gray-300 bg-white",
                    ].join(" ")}
                  >
                    {checked && <Check size={12} strokeWidth={3} />}
                  </div>

                  {/* Badge colorido com bolinha */}
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border pointer-events-none ${cfg.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                </label>
              );
            })}
          </div>

          {hasSelection && (
            <>
              <div className="border-t border-gray-100 mx-3 my-1" />
              <button
                onClick={() => { onChange([]); setOpen(false); }}
                className="w-full text-left px-4 py-2 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              >
                Limpar seleção
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface CategoryDropdownProps {
  selected: string[];
  onChange: (vals: string[]) => void;
}

function CategoryDropdown({ selected, onChange }: CategoryDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (val: string) =>
    onChange(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);

  const hasSelection = selected.length > 0;
  const displayLabel = hasSelection
    ? selected.length === 1
      ? CATEGORY_LABELS[selected[0]] ?? selected[0]
      : `Categoria (${selected.length})`
    : "Categoria";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={[
          "flex items-center justify-between gap-2 px-5 py-2 rounded-full text-sm border transition-all shadow-sm cursor-pointer w-48 h-10",
          open || hasSelection
            ? "bg-white border-blue-500 text-gray-800"
            : "bg-white border-gray-200 text-gray-600 hover:border-gray-300",
        ].join(" ")}
      >
        <span className="font-medium truncate">{displayLabel}</span>
        <ChevronDown size={16} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-2xl border border-gray-100 shadow-xl z-40 overflow-hidden py-2">
          <div className="flex flex-col gap-1 max-h-64 overflow-y-auto px-1">
            {CATEGORY_OPTIONS.map((cat) => {
              const colors = getCategoryColor(cat);
              const checked = selected.includes(cat);
              return (
                <label
                  key={cat}
                  className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors rounded-xl"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(cat)}
                    className="sr-only"
                  />
                  {/* Checkbox customizado */}
                  <div
                    className={[
                      "w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 pointer-events-none",
                      checked ? "bg-blue-500 border-blue-500 text-white" : "border-gray-300 bg-white",
                    ].join(" ")}
                  >
                    {checked && <Check size={12} strokeWidth={3} />}
                  </div>

                  {/* Badge colorido com bolinha, igual ao StatusDropdown */}
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border pointer-events-none ${colors.bg} ${colors.border} ${colors.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${colors.dot}`} />
                    {CATEGORY_LABELS[cat] ?? cat}
                  </span>
                </label>
              );
            })}
          </div>

          {hasSelection && (
            <>
              <div className="border-t border-gray-100 mx-3 my-1" />
              <button
                onClick={() => { onChange([]); setOpen(false); }}
                className="w-full text-left px-4 py-2 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              >
                Limpar seleção
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}


export default function SuportePage() {
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");

  const { data: tickets, total, loading, error, page, setPage, limit, refetch, kpis } =
    useTickets({ page: 1, limit: 7 });

  useEffect(() => {
    const timer = setTimeout(() => {
      refetch({
        page: 1,
        status: selectedStatus.length > 0 ? selectedStatus.join(",") : null,
        search: searchInput.trim() || null,
        categoria: selectedCategories.length > 0 ? selectedCategories.join(",") : null,
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]); 

  const totalPages = Math.ceil(total / limit) || 1;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total || tickets.length);

  return (
    <div className="min-h-screen bg-[#F4F7FE]">
      <div className="max-w-7xl mx-auto px-8 pb-12">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Suporte</h1>
          <p className="text-sm text-gray-400 mt-1">Acompanhe o andamento do canal de suporte</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <KpiCard
            iconBg="bg-red-100"
            icon={<TicketX className="text-red-500" size={22} />}
            label="Tickets em aberto"
            value={kpis["aberto"] ?? 0}
          />
          <KpiCard
            iconBg="bg-green-100"
            icon={<CheckCircle className="text-green-500" size={22} />}
            label="Resolvidos no mês"
            value={kpis["fechado_mes"] ?? 0}
          />
        </div>

        {/* Barra de Filtros */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Pesquisar por cliente, problema..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 shadow-sm transition-colors"
            />
          </div>

          <StatusDropdown
            selected={selectedStatus}
            onChange={(vals) => {
              setSelectedStatus(vals);
              refetch({
                page: 1,
                status: vals.length > 0 ? vals.join(",") : null,
                search: searchInput.trim() || null,
                categoria: selectedCategories.length > 0 ? selectedCategories.join(",") : null,
              });
            }}
          />

          <CategoryDropdown
            selected={selectedCategories}
            onChange={(vals) => {
              setSelectedCategories(vals);
              refetch({
                page: 1,
                status: selectedStatus.length > 0 ? selectedStatus.join(",") : null,
                search: searchInput.trim() || null,
                categoria: vals.length > 0 ? vals.join(",") : null,
              });
            }}
          />
        </div>

        {/* Lista de tickets */}
        {loading ? (
          <div className="mb-6">
            <TableSkeletonLoader rowCount={limit} cellCount={5} />
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-[#E2E8F0] bg-white border border-gray-200 rounded-2xl px-2 mb-6">
            {error && (
              <div className="py-10 text-center text-sm text-red-400">
                Erro ao carregar tickets: {error}
              </div>
            )}
            {!error && tickets.length === 0 && (
              <div className="py-10 text-center text-sm text-gray-400">Nenhum ticket encontrado.</div>
            )}
            {!error && tickets.map((ticket) => (
              <TicketRow key={ticket.id_ticket} ticket={ticket} />
            ))}
          </div>
        )}

        {/* Paginação */}
        {!loading && tickets.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Mostrando <strong className="text-gray-600">{String(from).padStart(2, "0")}</strong>{" "}
              a <strong className="text-gray-600">{String(to).padStart(2, "0")}</strong>
              {total > 0 && (
                <> de <strong className="text-gray-600">{total}</strong> resultados</>
              )}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
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
                    "w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium transition-colors cursor-pointer",
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
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
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