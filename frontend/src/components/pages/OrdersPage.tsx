import { useEffect, useMemo, useState } from "react";
import { DataTable } from "../organisms/DataTable";
import { FilterBar } from "../molecules/FilterBar";
import { PageHeader } from "../molecules/TitleHeaeder";
import { TableSkeletonLoader } from "../molecules/TableSkeletonLoader";
import { Upload } from "lucide-react";
import { exportCSV } from "../../utils/exportCSV";
import api from "../../services/api";
import { useOrders } from "../../hooks/useOrders";
import type { Pedido } from "../types/pedido.types";

type StatusKey = "entregue" | "processando" | "em trânsito" | "atrasado" | "aprovado" | "recusado" | "processado" | "reembolsado";

const STATUS_STYLES: Record<StatusKey, string> = {
  "entregue":    "bg-emerald-100 text-emerald-700",
  "processando": "bg-blue-100 text-blue-700",
  "em trânsito": "bg-amber-100 text-amber-700",
  "atrasado":    "bg-red-100 text-red-600",
  "aprovado":    "bg-emerald-100 text-emerald-700",
  "recusado":    "bg-red-100 text-red-600",
  "processado":  "bg-blue-100 text-blue-700",
  "reembolsado": "bg-gray-100 text-gray-600",
};

function getStatusStyle(value: string) {
  if (value in STATUS_STYLES) return STATUS_STYLES[value as StatusKey];
  return "bg-gray-100 text-gray-600";
}

const FILTERS = ["Todos", "Entregue", "Em processamento", "Em trânsito", "Atrasado"];

const columns = [
  { 
    key: "id_pedido",         
    label: "ID do Pedido",
    render: (value: string) => (
      <span title={value} className="block font-mono text-xs text-gray-500">
        {value}
      </span>
    )
  },
  { key: "nome_cliente",      label: "Cliente"             },
  { key: "nome_produto",      label: "Produto"             },
  { key: "categoria_produto", label: "Categoria"           },
  { 
    key: "metodo_pagamento",  
    label: "Pagamento",
    render: (value: string) => <span className="capitalize">{value}</span>
  },
  { 
    key: "valor_pedido",      
    label: "Valor",
    render: (value: string | number) => `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  },
  { key: "quantidade",        label: "Qtd."                },
  {
    key: "status",
    label: "Status",
    render: (value: string) => {
      const style = getStatusStyle(value);
      return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${style}`}>
          {value}
        </span>
      );
    },
  },
  { key: "data_pedido", label: "Data" },
];

export const OrdersPage = () => {
  const [search, setSearch]           = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchField, setSearchField] = useState("nome_cliente");
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [page, setPage]               = useState(1);
  const [pageSize, setPageSize]       = useState(10);

  const { pedidos, isFetching, total } = useOrders({
    page,
    pageSize,
    search,
    searchField,
    activeFilter
  });

      useEffect(() => {
        const timer = setTimeout(() => {
          setSearch(searchInput);
          setPage(1);
        }, 500);
        return () => clearTimeout(timer);
      }, [searchInput]);

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams({ limit: "999999", offset: "0" });
      if (search) params.append(searchField, search);
      if (activeFilter !== "Todos") params.append("status", activeFilter);

      const res = await api.get(`/pedidos_cliente?${params.toString()}`);
      
      const data = res.data;
      const items = Array.isArray(data) ? data : data.items ?? data.data ?? [];
      
      exportCSV(items, "pedidos");
    } catch (err) {
      console.error("Erro ao exportar todos os pedidos:", err);
    }
  };

  return (
    <div className="bg-[#F4F7FE]">
      <div className="max-w-7xl mx-auto px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1" style={{ letterSpacing: "-0.02em" }}>Pedidos</h1>
            <p className="mt-1 text-sm text-gray-400">Acompanhe todos os pedidos e seus status</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors cursor-pointer"
          >
            <Upload size={16} />
            Exportar CSV
          </button>
        </div>

        <div className="mb-6">
          <FilterBar
            search={searchInput}
            onSearchChange={setSearchInput}
            searchField={searchField}
            onSearchFieldChange={(field) => { setSearchField(field); setSearchInput(""); setSearch(""); setPage(1); }}
            />
        </div>

        <div>
          {isFetching ? (
            <TableSkeletonLoader rowCount={pageSize} cellCount={9} />
          ) : (
            <DataTable
              columns={columns}
              data={pedidos}
              maxHeight={550}
              pageSize={pageSize}
              setPageSize={(size) => { setPageSize(Number(size)); setPage(1); }}
              page={page}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </div>
  );
};