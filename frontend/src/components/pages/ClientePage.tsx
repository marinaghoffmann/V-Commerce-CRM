import { useEffect, useMemo, useState } from "react";
import { DataTable } from "../organisms/DataTable";
import { FilterBar } from "../molecules/FilterBar";
import { PageHeader } from "../molecules/TitleHeaeder";

interface Pedido {
  id: number;
  idPedido: string;
  cliente: string;
  produto: string;
  categoria: string;
  status: "Entregue" | "Em processamento" | "Em trânsito" | "Atrasado";
  data: string;
}

type StatusKey = "Entregue" | "Em processamento" | "Em trânsito" | "Atrasado";

const STATUS_STYLES: Record<StatusKey, { dot: string; pill: string }> = {
  "Entregue":           { dot: "bg-green-500",  pill: "border-green-300 text-green-700 bg-green-50"   },
  "Em processamento":   { dot: "bg-purple-500", pill: "border-purple-300 text-purple-700 bg-purple-50" },
  "Em trânsito":        { dot: "bg-blue-500",   pill: "border-blue-300 text-blue-700 bg-blue-50"       },
  "Atrasado":           { dot: "bg-orange-400", pill: "border-orange-300 text-orange-600 bg-orange-50" },
};

function getStatusStyle(value: string) {
  if (value in STATUS_STYLES) return STATUS_STYLES[value as StatusKey];
  return { dot: "bg-gray-400", pill: "border-gray-300 text-gray-600 bg-gray-50" };
}

const FILTERS = ["Todos", "Entregue", "Em processamento", "Em trânsito", "Atrasado"];

const MOCK_PEDIDOS: Pedido[] = [
  { id: 1,  idPedido: "#2412", cliente: "Theo Michilles",  produto: "Airfryer Philips Walita", categoria: "Eletrônicos", status: "Entregue",         data: "12/04/2025" },
  { id: 2,  idPedido: "#6769", cliente: "Luis Felipe",     produto: "Frigideira Inox",         categoria: "Casa",        status: "Em processamento", data: "03/04/2025" },
  { id: 3,  idPedido: "#1331", cliente: "Gabriela Amorim", produto: "Bolsa com alça",          categoria: "Moda",        status: "Em trânsito",      data: "28/04/2025" },
  { id: 4,  idPedido: "#2412", cliente: "Gabriela Amorim", produto: "Bolsa com alça",          categoria: "Moda",        status: "Atrasado",         data: "10/04/2025" },
  { id: 5,  idPedido: "#3301", cliente: "Thiago Mendes",   produto: "Tênis Nike Air",          categoria: "Moda",        status: "Entregue",         data: "01/04/2025" },
  { id: 6,  idPedido: "#4410", cliente: "Fernanda Lima",   produto: "Smart TV 55\"",           categoria: "Eletrônicos", status: "Em trânsito",      data: "15/04/2025" },
  { id: 7,  idPedido: "#5521", cliente: "Felipe Peixoto",  produto: "Sofá 3 lugares",          categoria: "Casa",        status: "Em processamento", data: "20/04/2025" },
  { id: 8,  idPedido: "#6632", cliente: "Camila Freitas",  produto: "Perfume Importado",       categoria: "Beleza",      status: "Entregue",         data: "05/04/2025" },
  { id: 9,  idPedido: "#7743", cliente: "Thiago Mendes",   produto: "Notebook Dell",           categoria: "Eletrônicos", status: "Atrasado",         data: "08/04/2025" },
  { id: 10, idPedido: "#8854", cliente: "Fernanda Lima",   produto: "Cadeira Gamer",           categoria: "Casa",        status: "Entregue",         data: "22/04/2025" },
];

const columns = [
  { key: "idPedido", label: "ID do Pedido" },
  { key: "cliente",  label: "Cliente" },
  { key: "produto",  label: "Produto" },
  { key: "categoria", label: "Categoria" },
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
  { key: "data", label: "Data" },
];

export const PedidosPage = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");

  useEffect(() => {
    const timer = setTimeout(() => {
      setPedidos(MOCK_PEDIDOS);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    return pedidos.filter((p) => {
      const matchFilter = activeFilter === "Todos" || p.status === activeFilter;
      const matchSearch =
        p.cliente.toLowerCase().includes(search.toLowerCase()) ||
        p.produto.toLowerCase().includes(search.toLowerCase()) ||
        p.idPedido.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [pedidos, search, activeFilter]);

  if (loading) return <p className="p-8 text-gray-500">Carregando...</p>;

  return (
    <div className="p-4">
      <PageHeader
        title="Pedidos"
        subtitle="Acompanhe todos os pedidos e seus status"
      />

      <div className="mb-4">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          filters={FILTERS}
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        maxHeight={600}
        pageSize={10}
      />
    </div>
  );
};