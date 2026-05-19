import { useEffect, useState } from "react";
import { Upload } from "lucide-react";

import { DataTable } from "../organisms/DataTable";
import { FilterBar } from "../molecules/FilterBar";
import { TableSkeletonLoader } from "../molecules/TableSkeletonLoader";
import { ExportCSVModal } from "../molecules/ExportCSVModal";

import { exportCSV } from "../../utils/exportCSV";
import { useOrders } from "../../hooks/useOrders";
import api from "../../services/api";

import type { DateRange } from "../atoms/DateRangeFilter";

type StatusKey =
  | "entregue"
  | "processando"
  | "em trânsito"
  | "atrasado"
  | "aprovado"
  | "recusado"
  | "processado"
  | "reembolsado";

const STATUS_STYLES: Record<StatusKey, string> = {
  entregue: "bg-emerald-100 text-emerald-700",
  processando: "bg-blue-100 text-blue-700",
  "em trânsito": "bg-amber-100 text-amber-700",
  atrasado: "bg-red-100 text-red-600",
  aprovado: "bg-emerald-100 text-emerald-700",
  recusado: "bg-red-100 text-red-600",
  processado: "bg-blue-100 text-blue-700",
  reembolsado: "bg-gray-100 text-gray-600",
};

function getStatusStyle(value: string) {
  const normalized = value?.toLowerCase?.() as StatusKey;

  if (normalized in STATUS_STYLES) {
    return STATUS_STYLES[normalized];
  }

  return "bg-gray-100 text-gray-600";
}

const columns = [
  {
    key: "id_pedido",
    label: "ID do Pedido",

    render: (value: string) => (
      <span
        title={value}
        className="block font-mono text-xs text-gray-500"
      >
        {value}
      </span>
    ),
  },

  {
    key: "nome_cliente",
    label: "Cliente",
  },

  {
    key: "nome_produto",
    label: "Produto",
  },

  {
    key: "categoria_produto",
    label: "Categoria",
  },

  {
    key: "metodo_pagamento",
    label: "Pagamento",

    render: (value: string) => (
      <span className="capitalize">
        {value?.toLowerCase() === "cartao"
          ? "cartão"
          : value}
      </span>
    ),
  },

  {
    key: "valor_pedido",
    label: "Valor",

    render: (value: string | number) =>
      `R$ ${Number(value).toLocaleString(
        "pt-BR",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}`,
  },

  {
    key: "quantidade",
    label: "Qtd.",
  },

  {
    key: "status",
    label: "Status",

    render: (value: string) => (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
          value
        )}`}
      >
        {value}
      </span>
    ),
  },

  {
    key: "data_pedido",
    label: "Data",
  },
];

export const OrdersPage = () => {
  const [searchInput, setSearchInput]             = useState("");
  const [search, setSearch]                       = useState("");
  const [dateRange, setDateRange]                 = useState<DateRange>({ data_inicio: null, data_fim: null });
  const [selectedCategoria, setSelectedCategoria] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus]       = useState<string[]>([]);
  const [page, setPage]                           = useState(1);
  const [pageSize, setPageSize]                   = useState(10);
  const [showExportModal, setShowExportModal]     = useState(false);
  const [isExporting, setIsExporting]             = useState(false);

  // debounce busca
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);

    return () => clearTimeout(t);
  }, [searchInput]);

  // reset página quando filtro muda
  useEffect(() => {
    setPage(1);
  }, [
    selectedCategoria,
    selectedStatus,
    dateRange,
    pageSize,
  ]);

  const {
    pedidos,
    isFetching,
    total,
    categoriaOptions,
    statusOptions,
  } = useOrders({
    page,
    pageSize,
    search,
    selectedCategoria,
    selectedStatus,
    startDate: dateRange.data_inicio,
    endDate: dateRange.data_fim,
  });

  const handleExportCSV = async () => {
    setShowExportModal(false);
    setIsExporting(true);
    
    try {
      const params = new URLSearchParams();
      params.append("limit", "999999");
      params.append("offset", "0");

      if (search.trim()) {
        params.append("nome_cliente", search);
        params.append("nome_produto", search);
      }
      if (selectedCategoria.length > 0) {
        params.append("categoria_produto", selectedCategoria[0]);
      }
      if (selectedStatus.length > 0) {
        params.append("status", selectedStatus[0]);
      }
      if (dateRange.data_inicio) {
        params.append("data_inicio", dateRange.data_inicio);
      }
      if (dateRange.data_fim) {
        params.append("data_fim", dateRange.data_fim);
      }

      const res = await api.get(`/pedidos_cliente?${params.toString()}`);
      exportCSV(res.data.items ?? [], "pedidos");
    } catch (err) {
      console.error("Erro ao exportar pedidos:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-[#F4F7FE]">
      <div className="max-w-7xl mx-auto px-8 pb-12">

        {/* header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-3xl font-bold text-gray-900 mb-1"
              style={{
                letterSpacing: "-0.02em",
              }}
            >
              Pedidos
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Acompanhe todos os pedidos e seus
              status
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
          onCancel={() =>
            setShowExportModal(false)
          }
          onConfirm={handleExportCSV}
        />

        {/* filtros */}
        <div className="mb-4">
          <FilterBar
            search={searchInput}
            onSearchChange={setSearchInput}

            dateRange={dateRange}
            onDateRangeChange={setDateRange}

            categoriaOptions={
              categoriaOptions
            }
            selectedCategoria={
              selectedCategoria
            }
            onCategoriaChange={
              setSelectedCategoria
            }

            statusOptions={statusOptions}
            selectedStatus={
              selectedStatus
            }
            onStatusChange={
              setSelectedStatus
            }
          />
        </div>

        {/* tabela */}
        {isFetching ? (
          <TableSkeletonLoader
            rowCount={pageSize}
            cellCount={9}
          />
        ) : (
          <DataTable
            columns={columns}
            data={pedidos}
            maxHeight={550}
            pageSize={pageSize}
            setPageSize={(size) => {
              setPageSize(Number(size));
              setPage(1);
            }}
            page={page}
            onPageChange={setPage}
            totalItems={total}
          />
        )}
      </div>
    </div>
  );
};