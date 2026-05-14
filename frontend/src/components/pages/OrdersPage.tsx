import { useEffect, useMemo, useState } from "react";
import { DataTable } from "../organisms/DataTable";
import { FilterBar } from "../molecules/FilterBar";
import { PageHeader } from "../molecules/TitleHeaeder";
import { Upload } from "lucide-react";
import { exportCSV } from "../../utils/exportCSV";
import { Navbar } from "../organisms/Navbar";
import { useOrders } from "../../hooks/useOrders";
import type { Pedido } from "../types/pedido.types";

type StatusKey = "entregue" | "processando" | "em trânsito" | "atrasado" | "aprovado" | "recusado" | "processado" | "reembolsado";

const STATUS_STYLES: Record<StatusKey, { dot: string; pill: string }> = {
  "entregue":    { dot: "bg-green-500",  pill: "border-green-300 text-green-700 bg-green-50"      },
  "processando": { dot: "bg-purple-500", pill: "border-purple-300 text-purple-700 bg-purple-50"   },
  "em trânsito": { dot: "bg-blue-500",   pill: "border-blue-300 text-blue-700 bg-blue-50"         },
  "atrasado":    { dot: "bg-orange-400", pill: "border-orange-300 text-orange-600 bg-orange-50"   },
  "aprovado":    { dot: "bg-green-500",  pill: "border-green-300 text-green-700 bg-green-50"      },
  "recusado":    { dot: "bg-red-500",    pill: "border-red-300 text-red-700 bg-red-50"            },
  "processado":  { dot: "bg-orange-400", pill: "border-yellow-300 text-yellow-700 bg-yellow-50"   },
  "reembolsado": { dot: "bg-red-500",    pill: "border-red-900 text-red-700 bg-red-50"            },
};

function getStatusStyle(value: string) {
  if (value in STATUS_STYLES) return STATUS_STYLES[value as StatusKey];
  return { dot: "bg-gray-400", pill: "border-gray-300 text-gray-600 bg-gray-50" };
}

const FILTERS = ["Todos", "Entregue", "Em processamento", "Em trânsito", "Atrasado"];

const columns = [
  { key: "id_pedido",         label: "ID do Pedido"        },
  { key: "nome_cliente",      label: "Cliente"             },
  { key: "nome_produto",      label: "Produto"             },
  { key: "categoria_produto", label: "Categoria"           },
  { key: "metodo_pagamento",  label: "Método de Pagamento" },
  { key: "valor_pedido",      label: "Valor"               },
  { key: "quantidade",        label: "Quantidade"          },
  {
    key: "status",
    label: "Status",
    render: (value: string) => {
      const style = getStatusStyle(value);
      return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5 border ${style.pill}`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
          {value}
        </span>
      );
    },
  },
  { key: "data_pedido", label: "Data do Pedido" },
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


  return (
    <div className="p-4">
      <Navbar/>

      <div className="flex items-center justify-between mb-6 pl-24 pr-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
          <p className="mt-1 text-sm text-gray-500">Acompanhe todos os pedidos e seus status</p>
        </div>
        <button
        onClick={() => exportCSV(pedidos, "pedidos")}
        className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors"
        >
        <Upload size={16} />
        Exportar CSV
        </button>
      </div>

      <div className="mb-4">
          <FilterBar
            search={searchInput}
            onSearchChange={setSearchInput}
            searchField={searchField}
            onSearchFieldChange={(field) => { setSearchField(field); setSearchInput(""); setSearch(""); setPage(1); }}
            activeFilter={activeFilter}
            onFilterChange={(filter) => { setActiveFilter(filter); setPage(1); }}
            filters={FILTERS}
            />
      </div>

      <div className={`transition-opacity duration-200 ${isFetching ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
        <DataTable
          columns={columns}
          data={pedidos}
          maxHeight={550}
          pageSize={pageSize}
          setPageSize={(size) => { setPageSize(Number(size)); setPage(1); }}
          page={page}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};