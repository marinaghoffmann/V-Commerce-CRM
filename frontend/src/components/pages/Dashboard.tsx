import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  XCircle,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Clock3,
  Package,
} 
from "lucide-react"; import {
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
} 
from "chart.js";

import { Line, Bar, Doughnut } from "react-chartjs-2";
import type { KpiStatusItem } from "../../components/types/dashboard.types";
import { useKpiStatus, useMonthlyKpi, useMonthlyReview, useMonthlyTickets } from "../../hooks/useDashboard";

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
  });
  const labels = orderedData.map((item) => item.status);
  const valores = orderedData.map((item) => item.total_pedidos);
  const colors = orderedData.map((item) => item.color);
  return { labels, valores, colors };
}

function getStatusIcon(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("recus")) return <XCircle className="text-[#C62828]" size={18} />;
  if (normalized.includes("aprov")) return <CheckCircle2 className="text-[#34A853]" size={18} />;
  if (normalized.includes("reembols")) return <RotateCcw className="text-[#E0A800]" size={18} />;
  if (normalized.includes("processando")) return <Clock3 className="text-[#F63BDD]" size={18} />;
  if (normalized.includes("processado")) return <Package className="text-[#7C4DFF]" size={18} />;
  return <Package className="text-gray-500" size={18} />;
}

function getStatusLabel(status: string) {
  const config = STATUS_CONFIG.find((c) => status.toLowerCase().includes(c.name));
  return config?.label || status;
}

function Dashboard() {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: Math.max(0, currentYear - 2022) },
    (_, index) => 2023 + index
  );

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [debouncedYear, setDebouncedYear] = useState(selectedYear);
  const [debouncedMonth, setDebouncedMonth] = useState(selectedMonth);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedYear(selectedYear);
      setDebouncedMonth(selectedMonth);
    }, 50);
    return () => clearTimeout(timer);
  }, [selectedYear, selectedMonth]);

  const { kpiStatus, loading: loadingStatus, error: errorStatus } = useKpiStatus({
    page: 1,
    limit: 10,
    ano: debouncedYear,
    mes: debouncedMonth,
  });

  const { data: monthlyData, loading: loadingMonthly, error: errorMonthly } =
    useMonthlyKpi(debouncedYear, debouncedMonth);

  const { data: reviewData, loading: loadingReview, error: errorReview } =
    useMonthlyReview(debouncedYear, debouncedMonth);

  const { data: ticketData, loading: loadingTicket, error: errorTicket } =
    useMonthlyTickets(debouncedYear, debouncedMonth);

  const loading = loadingStatus || loadingMonthly || loadingReview || loadingTicket;
  const error = errorStatus || errorMonthly || errorReview || errorTicket;

  const monthLabels = monthlyData?.map((item) =>
    `${String(item.mes).padStart(2, "0")}/${String(item.ano).slice(-2)}`
  ) || [];
  const revenueValues = monthlyData?.map((item) => item.receita_total) || [];

  const lastMonth = monthlyData?.[monthlyData.length - 1] ?? {
    receita_total: 0,
    total_pedidos: 0,
    ticket_medio: 0,
  };

  const previousMonth = monthlyData?.[monthlyData.length - 2] ?? {
    receita_total: 0,
    total_pedidos: 0,
    ticket_medio: 0,
  };

  const calculateVariation = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const revenueVariation = calculateVariation(lastMonth.receita_total, previousMonth.receita_total);
  const ordersVariation = calculateVariation(lastMonth.total_pedidos, previousMonth.total_pedidos);
  const ticketVariation = calculateVariation(lastMonth.ticket_medio, previousMonth.ticket_medio);

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

  const { labels, valores, colors } = transformarStatus(kpiStatus || []);
  const totalPedidos = valores.reduce((sum, value) => sum + value, 0);
  const porcentagens = valores.map((valor) =>
    totalPedidos > 0 ? Number(((valor / totalPedidos) * 100).toFixed(2)) : 0
  );

  const statusData = {
    labels,
    datasets: [
      {
        data: porcentagens,
        backgroundColor: colors,
        borderColor: "#ffffff",
        borderWidth: 1,
        hoverOffset: 10,
        borderRadius: { topLeft: 4, topRight: 4 },
        minBarLength: 5,
      },
    ],
  };

  const pluginPorcentagemNoTopo = {
    id: "porcentagemNoTopo",
    afterDatasetsDraw(chart: any) {
      const { ctx } = chart;
      chart.data.datasets.forEach((dataset: any, i: number) => {
        const meta = chart.getDatasetMeta(i);
        meta.data.forEach((bar: any, index: number) => {
          const valor = dataset.data[index];
          ctx.fillStyle = "#4B5563";
          ctx.font = "bold 12px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          const textoFormatado = Number(valor).toFixed(2).replace(".", ",") + "%";
          ctx.fillText(textoFormatado, bar.x, bar.y - 5);
        });
      });
    },
  };

  const mesAtual = reviewData;
  const satisfacaoValores = [mesAtual?.positiva ?? 0, mesAtual?.neutra ?? 0, mesAtual?.ruim ?? 0];
  const satisfacaoCores = ["#5CA860", "#8A8D93", "#C64C4B"];
  const satisfacaoFundoCinza = satisfacaoValores.map((valor) => 100 - valor);
  const satisfacaoData = {
    labels: ["Positivo", "Neutro", "Negativo"],
    datasets: [
      { data: satisfacaoValores, backgroundColor: satisfacaoCores, barThickness: 45 },
      { data: satisfacaoFundoCinza, backgroundColor: "#EBEDF0", barThickness: 45 },
    ],
  };

  const pluginTextoHorizontal = {
    id: "textoHorizontal",
    afterDatasetsDraw(chart: any) {
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);
      meta.data.forEach((bar: any, index: number) => {
        const valor = chart.data.datasets[0].data[index];
        ctx.fillStyle = "#4B5563";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(`${valor}%`, bar.x + 8, bar.y);
      });
    },
  };

  const mesAtualTicket = ticketData;
  const totalEntregas = (mesAtualTicket?.entrega_no_prazo ?? 0) + (mesAtualTicket?.entrega_atrasada ?? 0);
  const noPrazoPercent = totalEntregas > 0 ? Math.round(((mesAtualTicket?.entrega_no_prazo ?? 0) / totalEntregas) * 100) : 0;
  const atrasadoPercent = totalEntregas > 0 ? Math.round(((mesAtualTicket?.entrega_atrasada ?? 0) / totalEntregas) * 100) : 0;

const noPrazo = mesAtualTicket?.entrega_no_prazo ?? 0;
const atrasado = mesAtualTicket?.entrega_atrasada ?? 0;

const semDados = noPrazo + atrasado === 0;

const entregaData = {
  labels: ["No prazo", "Atrasado"],
  datasets: [
    {
      data:
      semDados? [1] 
      : [noPrazo, atrasado],
      backgroundColor: semDados
        ? ["#95959543", "#95959543"]
        : ["#5CA860", "#F47B20"],
      borderColor: "#ffffff",
      borderWidth: 2,
      cutout: "70%",
    },
  ],
};

  const pluginTextoCentralRosca = {
    id: "textoCentralRosca",
    beforeDraw(chart: any) {
      const { ctx, width, height } = chart;
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#2B2B2B";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(
        new Intl.NumberFormat("pt-BR").format(totalEntregas),
        width / 2,
        height / 2 - 12
      );
      ctx.fillStyle = "#2B2B2B";
      ctx.font = "12px sans-serif";
      ctx.fillText("entregas", width / 2, height / 2 + 16);
      ctx.restore();
    },
  };

  const cardStyle = "bg-white border-2 border-black/10 rounded-2xl p-6 shadow-sm";

  return (
    <div className="min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-[#2B2B2B]">Dashboard Mensal</h1>
            <p className="text-sm text-gray-500 mt-1">CRM 360 visão geral mensal</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-[#8B7CF8]"
            >
              <option value={1}>Janeiro</option>
              <option value={2}>Fevereiro</option>
              <option value={3}>Março</option>
              <option value={4}>Abril</option>
              <option value={5}>Maio</option>
              <option value={6}>Junho</option>
              <option value={7}>Julho</option>
              <option value={8}>Agosto</option>
              <option value={9}>Setembro</option>
              <option value={10}>Outubro</option>
              <option value={11}>Novembro</option>
              <option value={12}>Dezembro</option>
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-[#8B7CF8]"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-lg font-medium text-center text-gray-500 bg-white rounded-2xl border-2 border-black/10">
            Carregando dashboard...
          </div>
        ) : error ? (
          <div className="p-10 text-red-500 bg-white rounded-2xl border-2 border-red-200">
            Erro ao carregar dashboard: {error}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className={cardStyle}>
                <p className="text-sm text-[#333] font-medium mb-4">Receita mensal total</p>
                <h2 className="text-3xl font-black text-[#2E2E2E] mb-4">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(lastMonth.receita_total)}
                </h2>
                <div className={`flex items-center gap-1 text-xs font-medium ${revenueVariation >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {revenueVariation >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span>{Math.abs(revenueVariation).toFixed(1)}% vs. mês anterior</span>
                </div>
              </div>
              <div className={cardStyle}>
                <p className="text-sm text-[#333] font-medium mb-4">Total de pedidos mensal</p>
                <h2 className="text-3xl font-black text-[#2E2E2E] mb-4">
                  {new Intl.NumberFormat("pt-BR").format(lastMonth.total_pedidos)}
                </h2>
                <div className={`flex items-center gap-1 text-xs font-medium ${ordersVariation >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {ordersVariation >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span>{Math.abs(ordersVariation).toFixed(1)}% vs. mês anterior</span>
                </div>
              </div>
              <div className={cardStyle}>
                <p className="text-sm text-[#333] font-medium mb-4">Ticket médio</p>
                <h2 className="text-3xl font-black text-[#2E2E2E] mb-4">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(lastMonth.ticket_medio)}
                </h2>
                <div className={`flex items-center gap-1 text-xs font-medium ${ticketVariation >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {ticketVariation >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span>{Math.abs(ticketVariation).toFixed(1)}% vs. mês anterior</span>
                </div>
              </div>
            </div>

            <div className={`${cardStyle} mb-6`}>
              <h2 className="text-xl font-bold text-[#2B2B2B] mb-6">Gráfico de receita mensal</h2>
              <div className="h-[350px]">
                <Line
                  data={revenueData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { grid: { display: false } },
                      y: { beginAtZero: true, grid: { color: "#F3F4F6" }, border: { display: false }, suggestedMax: 35000000 },
                    },
                  }}
                />
              </div>
            </div>

            <div className={`${cardStyle} mb-6`}>
              <h2 className="text-xl font-bold text-[#2B2B2B] mb-6">Distribuição de pedidos por status</h2>
              <div className="h-[300px]">
                <Bar
                  key={`status-chart-${debouncedYear}-${debouncedMonth}`}
                  data={statusData}
                  plugins={[pluginPorcentagemNoTopo]}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: { padding: { top: 20 } },
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const valorFormatado = Number(context.raw).toFixed(2).replace(".", ",");
                            return ` ${valorFormatado}% dos pedidos`;
                          },
                        },
                      },
                    },
                    scales: {
                      x: { display: false },
                      y: {
                        min: 0,
                        max: 100,
                        ticks: { callback: (value) => `${value}%`, stepSize: 20 },
                        grid: { color: "#F3F4F6" },
                        border: { display: false },
                      },
                    },
                  }}
                />
              </div>
              <div className="flex mt-4 border-t border-gray-100 pt-4 pl-[35px]">
                {labels.map((label) => (
                  <div key={label} className="flex-1 flex flex-col md:flex-row items-center justify-center gap-2 text-sm font-semibold text-gray-700">
                    {getStatusIcon(label)}
                    <span>{getStatusLabel(label)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={cardStyle}>
                <h2 className="text-xl font-bold text-[#2B2B2B] mb-6">Taxa de satisfação</h2>
                <div className="h-[300px]">
                  <Bar
                    data={satisfacaoData}
                    plugins={[pluginTextoHorizontal]}
                    options={{
                      indexAxis: "y",
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false }, tooltip: { enabled: false } },
                      scales: {
                        x: {
                          stacked: true,
                          position: "top",
                          min: 0,
                          max: 100,
                          ticks: { callback: (value) => `${value}%`, stepSize: 20 },
                          grid: { color: "#F3F4F6" },
                          border: { display: false },
                        },
                        y: {
                          stacked: true,
                          grid: { display: false },
                          border: { display: true, color: "#9CA3AF" },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <div className={cardStyle}>
                <h2 className="text-xl font-bold text-[#2B2B2B] mb-6">Indicador de entrega</h2>
                <div className="h-[250px]">
                  <Doughnut
                    key={`entrega-chart-${debouncedYear}-${debouncedMonth}-${totalEntregas}`}
                    data={entregaData}
                    plugins={[pluginTextoCentralRosca]}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false }, tooltip: { enabled: false } },
                    }}
                  />
                </div>
                <div className="flex justify-around items-center mt-4 border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-[#5CA860]" size={20} />
                    <span className="text-base font-semibold text-gray-700">No prazo {noPrazoPercent}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="text-[#F47B20]" size={20} />
                    <span className="text-base font-semibold text-gray-700">Atrasado {atrasadoPercent}%</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;