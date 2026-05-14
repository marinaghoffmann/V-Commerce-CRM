import {
  TrendingUp,
  TrendingDown,
  XCircle,
  CheckCircle2,
  RotateCcw,
  Clock3,
  Package,
} from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import { Line, Pie } from "react-chartjs-2";
import type { KpiStatusItem } from "../../components/types/dashboard.types";

import { useKpiStatus, useMonthlyKpi } from "../../hooks/useDashboard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
);

const STATUS_CONFIG = [
  { name: "recusado", color: "#C62828", label: "Recusado" },
  { name: "aprovado", color: "#34A853", label: "Aprovado" },
  { name: "reembolsado", color: "#E0A800", label: "Reembolsado" },
  { name: "processando", color: "#F63BDD", label: "Processando" },
  { name: "processado", color: "#7C4DFF", label: "Processado" },
];

function transformarStatus(data: KpiStatusItem[]) {
  const statusMap = new Map(data.map((item) => [item.status.toLowerCase(), item]));

  const orderedData = STATUS_CONFIG.map((config) => {
    const item = Array.from(statusMap.values()).find((d) =>
      d.status.toLowerCase().includes(config.name)
    );
    return {
      status: config.label,
      total_pedidos: item?.total_pedidos || 0,
      color: config.color,
    };
  }).filter((item) => item.total_pedidos > 0);

  const labels = orderedData.map((item) => item.status);
  const valores = orderedData.map((item) => item.total_pedidos);
  const colors = orderedData.map((item) => item.color);

  return {
    labels,
    valores,
    colors,
  };
}

function getStatusIcon(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes("recus")) {
    return <XCircle className="text-red-500" size={16} />;
  }

  if (normalized.includes("aprov")) {
    return <CheckCircle2 className="text-green-500" size={16} />;
  }

  if (normalized.includes("reembols")) {
    return <RotateCcw className="text-yellow-500" size={16} />;
  }

  if (normalized.includes("processando")) {
    return <Clock3 className="text-pink-500" size={16} />;
  }

  if (normalized.includes("processado")) {
    return <Package className="text-sky-500" size={16} />;
  }

  return <Package className="text-gray-500" size={16} />;
}

function getStatusLabel(status: string) {
  const config = STATUS_CONFIG.find((c) => status.toLowerCase().includes(c.name));
  return config?.label || status;
}

function Dashboard() {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const { kpiStatus, loading: loadingStatus, error: errorStatus } = useKpiStatus({
    page: 1,
    limit: 10,
    ano: year,
    mes: month,
  });

  const {
    data: monthlyData,
    loading: loadingMonthly,
    error: errorMonthly,
  } = useMonthlyKpi(year, month);

  const loading = loadingStatus || loadingMonthly;
  const error = errorStatus || errorMonthly;

  const monthLabels = monthlyData.map((item) =>
    `${String(item.mes).padStart(2, "0")}/${String(item.ano).slice(-2)}`
  );
  const revenueValues = monthlyData.map((item) => item.receita_total);

  const lastMonth = monthlyData[monthlyData.length - 1] ?? {
    receita_total: 0,
    total_pedidos: 0,
    ticket_medio: 0,
  };

  const previousMonth = monthlyData[monthlyData.length - 2] ?? {
    receita_total: 0,
    total_pedidos: 0,
    ticket_medio: 0,
  };

  const calculateVariation = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const revenueVariation = calculateVariation(
    lastMonth.receita_total,
    previousMonth.receita_total
  );
  const ordersVariation = calculateVariation(
    lastMonth.total_pedidos,
    previousMonth.total_pedidos
  );
  const ticketVariation = calculateVariation(
    lastMonth.ticket_medio,
    previousMonth.ticket_medio
  );

  const revenueData = {
    labels: monthLabels,
    datasets: [
      {
        data: revenueValues,
        borderColor: "#8B7CF8",
        backgroundColor: "rgba(139,124,248,0.18)",
        fill: true,
        tension: 0.45,
        pointRadius: 3,
        pointBackgroundColor: "#8B7CF8",
        borderWidth: 1,
      },
    ],
  };

  const { labels, valores, colors } = transformarStatus(kpiStatus);

  const totalPedidos = valores.reduce((sum, value) => sum + value, 0);

  const statusData = {
    labels,
    datasets: [
      {
        data: valores,
        backgroundColor: colors,
        borderColor: "#ffffff",
        borderWidth: 1,
        hoverOffset: 10,
      },
    ],
  };

const cardStyle =
  "bg-white border-2 border-black/25 rounded-2xl p-6";

  if (loading) {
    return (
      <div className="p-10 text-lg font-medium">
        Carregando dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-red-500">
        Erro ao carregar dashboard: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-6">

        <div className="mb-8">
          <h1 className="text-5xl font-black tracking-tight text-[#2B2B2B]">
            Dashboard Mensal
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            CRM 360 visão geral mensal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className={cardStyle}>
            <p className="text-sm text-[#333] font-medium mb-4">
              Receita mensal total
            </p>

            <h2 className="text-4xl font-black text-[#2E2E2E] mb-4">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(lastMonth.receita_total)}
            </h2>

            <div className={`flex items-center gap-1 text-xs ${revenueVariation >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {revenueVariation >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{Math.abs(revenueVariation).toFixed(1)}% vs. mês anterior</span>
            </div>
          </div>

          <div className={cardStyle}>
            <p className="text-sm text-[#333] font-medium mb-4">
              Total de pedidos mensal
            </p>

            <h2 className="text-4xl font-black text-[#2E2E2E] mb-4">
              {new Intl.NumberFormat("pt-BR").format(lastMonth.total_pedidos)}
            </h2>

            <div className={`flex items-center gap-1 text-xs ${ordersVariation >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {ordersVariation >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{Math.abs(ordersVariation).toFixed(1)}% vs. mês anterior</span>
            </div>
          </div>

          <div className={cardStyle}>
            <p className="text-sm text-[#333] font-medium mb-4">
              Ticket médio
            </p>

            <h2 className="text-4xl font-black text-[#2E2E2E] mb-4">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(lastMonth.ticket_medio)}
            </h2>

            <div className={`flex items-center gap-1 text-xs ${ticketVariation >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {ticketVariation >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{Math.abs(ticketVariation).toFixed(1)}% vs. mês anterior</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className={`${cardStyle} lg:col-span-2`}>
            <h2 className="text-xl font-semibold text-[#2B2B2B] mb-4">
              Gráfico de receita mensal
            </h2>

            <div className="h-[430px]">
              <Line
                data={revenueData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className={cardStyle}>
            <h2 className="text-xl font-semibold text-[#2B2B2B] mb-6">
              Pedidos por status
            </h2>

            <div className="w-full flex justify-center mb-8">
              <div className="w-64">
                <Pie
                  data={statusData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,},
                      tooltip: {
                        callbacks: {
                          label: ({ label, parsed }) => {
                            const value = Number(parsed || 0);
                            const percentage = totalPedidos
                              ? ((value / totalPedidos) * 100).toFixed(1)
                              : "0.0";
                            return `${label}: ${value} (${percentage}%)`;
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {kpiStatus.map((item) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    {getStatusLabel(item.status)}
                  </span>

                  <span className="font-semibold">
                    {item.total_pedidos}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;