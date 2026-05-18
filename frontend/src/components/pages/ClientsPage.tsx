import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Upload, Search, ChevronDown } from "lucide-react";
import { exportCSV } from "../../utils/exportCSV";
import { useClientes } from "../../hooks/useClientes";
import { TableSkeletonLoader } from "../molecules/TableSkeletonLoader";

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

function Clients() {
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const navigate = useNavigate();

  const { clientes, total, loading } = useClientes({ busca, status, page, limit });

  const handleBusca = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusca(e.target.value);
    setPage(1);
  };
  const handleStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
    setPage(1);
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
            onClick={() => exportCSV(clientes, "clientes")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors cursor-pointer"
          >
            <Upload size={16} />
            Exportar CSV
          </button>
        </div>

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
          <div className="relative flex-none" style={{ width: "200px" }}>
            <select
              className="w-full border border-gray-200 px-5 py-2.5 bg-white text-sm text-gray-600 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-sm transition-all appearance-none"
              style={{ borderRadius: "28px" }}
              value={status}
              onChange={handleStatus}
            >
              <option value="">Segmento</option>
              <option value="Premium">Premium</option>
              <option value="Inativo">Inativo</option>
              <option value="Recorrente">Recorrente</option>
              <option value="Novo">Novo</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {loading ? (
          <TableSkeletonLoader rowCount={limit} cellCount={6} />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr className="border-b border-gray-100 bg-blue-50">
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
                    <td className="px-6 py-4 text-center text-gray-400 text-xs">{c.data_ultima_compra}</td>
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

            <div className="mt-6 flex items-center justify-between px-6 pb-4">
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
              </div>
            </div>
          </div>
          )}
      </div>
    </div>
  );
}

export default Clients;