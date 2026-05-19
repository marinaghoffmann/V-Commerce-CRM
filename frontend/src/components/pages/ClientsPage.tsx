import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Upload, Search, ChevronDown, ChevronUp, ArrowUp, ArrowDown, Check } from "lucide-react";
import { exportCSV } from "../../utils/exportCSV";
import api from "../../services/api";
import { useClientes } from "../../hooks/useClientes";
import { TableSkeletonLoader } from "../molecules/TableSkeletonLoader";
import { PageSizeSelect } from "../atoms/PageSizeSelect";
import { ExportCSVModal } from "../molecules/ExportCSVModal";
import { DropdownFilter } from "../atoms/DropdownFilter";

function getInitials(nome: string, sobrenome: string) {
  return `${nome?.[0] ?? ""}${sobrenome?.[0] ?? ""}`.toUpperCase();
}

function getSegmentStyle(segmento: string): string {
  switch (segmento?.toLowerCase()) {
    case "premium": return "bg-amber-100 text-amber-700";
    case "inativo": return "bg-red-100 text-red-600";
    case "recorrente": return "bg-blue-100 text-blue-700";
    case "novo": return "bg-emerald-100 text-emerald-700";
    default: return "bg-gray-100 text-gray-600";
  }
}

function getAvatarColor(nome: string): string {
  const colors = [
    "bg-blue-500", "bg-purple-500", "bg-emerald-500",
    "bg-orange-400", "bg-pink-500", "bg-teal-500",
  ];
  return colors[(nome?.charCodeAt(0) ?? 0) % colors.length];
}

type OrderOption = {
  label: string;
  value: string;
  icon: typeof ArrowUp;
};

const ORDER_OPTIONS: OrderOption[] = [
  { label: "Maior receita", value: "receita_total_cliente:desc", icon: ArrowUp },
  { label: "Menor receita", value: "receita_total_cliente:asc", icon: ArrowDown },
  { label: "Mais pedidos", value: "total_compras:desc", icon: ArrowUp },
  { label: "Menos pedidos", value: "total_compras:asc", icon: ArrowDown },
  { label: "Maior ticket", value: "ticket_medio:desc", icon: ArrowUp },
  { label: "Menor ticket", value: "ticket_medio:asc", icon: ArrowDown },
  { label: "Mais recente", value: "data_ultima_compra:desc", icon: ArrowUp },
  { label: "Mais antigo", value: "data_ultima_compra:asc", icon: ArrowDown },
];

function OrderFilter({ selected, onSelect }: { selected: string; onSelect: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedOption = ORDER_OPTIONS.find((option) => option.value === selected);

  return (
    <div ref={ref} className="relative flex-none" style={{ width: "200px" }}>
      <button
        onClick={() => setOpen((current) => !current)}
        className={`flex items-center justify-between gap-2 w-full border px-5 py-2.5 rounded-full text-sm transition-all shadow-sm cursor-pointer ${
          open || selected
            ? "border-blue-500 bg-white text-gray-800"
            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
        }`}
      >
        <span className="font-medium truncate">{selectedOption ? selectedOption.label : "Ordenar por"}</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-120 bg-white rounded-2xl border border-gray-100 shadow-xl z-40 overflow-hidden py-3">
          <div className="grid grid-cols-2 divide-x divide-gray-100 max-h-100 overflow-y-auto">
            {ORDER_OPTIONS.map((option) => {
              const isSelected = selected === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onSelect(selected === option.value ? "" : option.value);
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                      isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                      <option.icon size={12} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 truncate">{option.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Clients() {
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<string[]>([]);
  const [ordem, setOrdem] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const navigate = useNavigate();

  const { clientes, total, loading } = useClientes({ busca, status, ordem, page, limit });

  const handleBusca = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusca(e.target.value);
    setPage(1);
  };
  const handleStatus = (values: string[]) => {
    setStatus(values);
    setPage(1);
  };

  const handleOrdem = (value: string) => {
    setOrdem(value);
    setPage(1);
  };

  const handleExportCSV = async () => {
    setShowExportModal(false);
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.append("busca", busca);
      status.forEach((segmento) => params.append("status", segmento));
      if (ordem) params.append("ordem", ordem);
      params.append("limit", "999999");
      params.append("page", "1");

      const res = await api.get(`/clientes/?${params.toString()}`);
      exportCSV(res.data, "clientes");
    } catch (err) {
      console.error("Erro ao exportar clientes:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const inicio = clientes.length === 0 ? 0 : (page - 1) * limit + 1;
  const fim = (page - 1) * limit + clientes.length;
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="min-h-screen bg-[#F4F7FE]">
      <div className="max-w-7xl mx-auto px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black mb-1" style={{ letterSpacing: "-0.02em" }}>
            Clientes
          </h1>
          <p className="text-gray-400 text-sm">
            Visão 360 de cada cliente: segmento, pedidos e métricas
          </p>
        </div>
        <button
          onClick={() => setShowExportModal(true)}
          disabled={isExporting}
          className={`flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer ${
            isExporting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-900 hover:bg-blue-800"
          }`}
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />
              Exportando...
            </>
          ) : (
            <>
              <Upload size={16} />
              Exportar CSV
            </>
          )}
        </button>
        </div>

        <ExportCSVModal
          isOpen={showExportModal}
          onCancel={() => setShowExportModal(false)}
          onConfirm={handleExportCSV}
        />

        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            />
            <input
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all"
              style={{ borderRadius: "28px" }}
              type="text"
              placeholder="Pesquisar por..."
              value={busca}
              onChange={handleBusca}
            />
          </div>
          <OrderFilter selected={ordem} onSelect={handleOrdem} />
          <DropdownFilter
            label="Segmento"
            options={["Premium", "Inativo", "Recorrente", "Novo"]}
            selected={status}
            onChange={handleStatus}
          />
        </div>

        {loading ? (
          <TableSkeletonLoader rowCount={limit} cellCount={6} />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div style={{ maxHeight: 550 }} className="overflow-y-auto">
              <table className="w-full" style={{ borderCollapse: "collapse" }}>
                <thead className="sticky top-0 z-10 bg-blue-50">
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-800 uppercase tracking-widest">Cliente</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-800 uppercase tracking-widest">Segmento</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-800 uppercase tracking-widest">Pedidos</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-800 uppercase tracking-widest">LTV</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-800 uppercase tracking-widest">Ticket Médio</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-800 uppercase tracking-widest">Último Pedido</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr
                    key={c.id_cliente}
                    onClick={() => navigate(`/clientes/${c.id_cliente}`)}
                    className="border-b border-gray-50 last:border-b-0 cursor-pointer transition-colors duration-150 hover:bg-blue-50/40"
                  >
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${getAvatarColor(c.nome)}`}>
                          {getInitials(c.nome, c.sobrenome)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 text-sm">{c.nome} {c.sobrenome}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getSegmentStyle(c.segmento_cliente)}`}>
                        {c.segmento_cliente}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-center">{c.total_compras}</td>
                    <td className="px-6 py-4 text-sm text-center font-semibold text-blue-600">
                      R$ {c.receita_total_cliente?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-center">
                      R$ {c.ticket_medio?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-400 text-xs">
                      {c.data_ultima_compra || "Indisponível"}
                    </td>
                  </tr>
                ))}
                {clientes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-gray-400 text-sm">
                      Nenhum cliente encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>

            <div className="mt-6 flex items-center justify-between px-6 pb-4 border-t border-gray-100 pt-4">
              <span className="text-xs text-gray-400">
                Mostrando {String(inicio).padStart(2, "0")} a {String(fim).padStart(2, "0")} de {String(total).padStart(2, "0")} resultados
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
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
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <ChevronRight size={15} />
                </button>
                <div className="ml-2">
                  <PageSizeSelect
                    value={limit}
                    onChange={(size) => { setLimit(size); setPage(1); }}
                  />
                </div>
              </div>
            </div>
          </div>
          )}
      </div>
    </div>
  );
}

export default Clients;