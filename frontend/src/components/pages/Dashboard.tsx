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

import { Line, Bar, Doughnut } from "react-chartjs-2";
import type { KpiStatusItem } from "../../components/types/dashboard.types";
import {
  useKpiStatus,
  useMonthlyKpi,
  useMonthlyReview,
  useMonthlyTickets,
  useKpiCategoria,
  useKpiEstado,
} from "../../hooks/useDashboard";

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
  { name: "recusado",    color: "#C62828", label: "Recusado"    },
  { name: "aprovado",    color: "#34A853", label: "Aprovado"    },
  { name: "reembolsado", color: "#E0A800", label: "Reembolsado" },
  { name: "processando", color: "#F63BDD", label: "Processando" },
  { name: "processado",  color: "#7C4DFF", label: "Processado"  },
];

const CHART_COLORS = [
  "#34A853", "#3B6FF6", "#7C4DFF", "#F97316",
  "#C62828", "#E0A800", "#F63BDD", "#06B6D4",
  "#84CC16", "#F43F5E",
];

const ESTADOS_FALLBACK = [
  "Acre", "Alagoas", "Amapá", "Amazonas", "Bahia",
  "Ceará", "Distrito Federal", "Espírito Santo", "Goiás", "Maranhão",
  "Mato Grosso", "Mato Grosso do Sul", "Minas Gerais", "Pará", "Paraíba",
  "Paraná", "Pernambuco", "Piauí", "Rio de Janeiro", "Rio Grande do Norte",
  "Rio Grande do Sul", "Rondônia", "Roraima", "Santa Catarina", "São Paulo",
  "Sergipe", "Tocantins",
];

type ChartView = "status" | "categoria" | "estado";

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
  return {
    labels: orderedData.map((item) => item.status),
    valores: orderedData.map((item) => item.total_pedidos),
    colors: orderedData.map((item) => item.color),
  };
}

function getStatusIcon(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("recus"))       return <XCircle className="text-[#C62828]" size={18} />;
  if (normalized.includes("aprov"))       return <CheckCircle2 className="text-[#34A853]" size={18} />;
  if (normalized.includes("reembols"))    return <RotateCcw className="text-[#E0A800]" size={18} />;
  if (normalized.includes("processando")) return <Clock3 className="text-[#F63BDD]" size={18} />;
  if (normalized.includes("processado"))  return <Package className="text-[#7C4DFF]" size={18} />;
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

  const [selectedYear, setSelectedYear]     = useState(currentYear);
  const [selectedMonth, setSelectedMonth]   = useState(new Date().getMonth() + 1);
  const [debouncedYear, setDebouncedYear]   = useState(selectedYear);
  const [debouncedMonth, setDebouncedMonth] = useState(selectedMonth);
  const [chartView, setChartView]           = useState<ChartView>("status");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedYear(selectedYear);
      setDebouncedMonth(selectedMonth);
    }, 50);
    return () => clearTimeout(timer);
  }, [selectedYear, selectedMonth]);

  const { kpiData: kpiStatus, loading: loadingStatus, error: errorStatus } = useKpiStatus({
    page: 1,
    limit: 10,
    ano: debouncedYear,
    mes: debouncedMonth,
    kpiType: "status",
  });
  const { data: monthlyData, loading: loadingMonthly, error: errorMonthly } =
    useMonthlyKpi(debouncedYear, debouncedMonth);
  const { data: reviewData,  loading: loadingReview,  error: errorReview  } =
    useMonthlyReview(debouncedYear, debouncedMonth);
  const { data: ticketData,  loading: loadingTicket,  error: errorTicket  } =
    useMonthlyTickets(debouncedYear, debouncedMonth);
  const { data: kpiCategoria } = useKpiCategoria(debouncedYear, debouncedMonth);
  const { data: kpiEstado    } = useKpiEstado(debouncedYear, debouncedMonth);

  const loading = loadingStatus || loadingMonthly || loadingReview || loadingTicket;
  const error   = errorStatus  || errorMonthly  || errorReview  || errorTicket;

  const monthLabels   = monthlyData?.map((item) => `${String(item.mes).padStart(2, "0")}/${String(item.ano).slice(-2)}`) || [];
  const revenueValues = monthlyData?.map((item) => item.receita_total) || [];

  const lastMonth     = monthlyData?.[monthlyData.length - 1]  ?? { receita_total: 0, total_pedidos: 0, ticket_medio: 0 };
  const previousMonth = monthlyData?.[monthlyData.length - 2] ?? { receita_total: 0, total_pedidos: 0, ticket_medio: 0 };

  const calculateVariation = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const revenueVariation = calculateVariation(lastMonth.receita_total, previousMonth.receita_total);
  const ordersVariation  = calculateVariation(lastMonth.total_pedidos,  previousMonth.total_pedidos);
  const ticketVariation  = calculateVariation(lastMonth.ticket_medio,   previousMonth.ticket_medio);

  const revenueData = {
    labels: monthLabels,
    datasets: [{
      data: revenueValues,
      borderColor: "#8B7CF8",
      backgroundColor: "rgba(139,124,248,0.18)",
      fill: true,
      tension: 0.45,
      pointRadius: 3,
      pointBackgroundColor: "#8B7CF8",
      borderWidth: 1,
    }],
  };

  // Status chart
  const statusData = (kpiStatus || []) as KpiStatusItem[];
  const { labels, valores, colors } = transformarStatus(statusData);
  const totalPedidosStatus = valores.reduce((sum, v) => sum + v, 0);
  const porcentagensStatus = valores.map((v) =>
    totalPedidosStatus > 0 ? Number(((v / totalPedidosStatus) * 100).toFixed(2)) : 0
  );

  // Categoria chart
  let categoriasLabels: string[] = [];
  let categoriasValores: number[] = [];
  if (kpiCategoria && kpiCategoria.length > 0) {
    const sortedCategorias = [...kpiCategoria].sort((a, b) =>
      a.categoria.localeCompare(b.categoria, "pt-BR")
    );
    categoriasLabels = sortedCategorias.map((k) => k.categoria);
    categoriasValores = sortedCategorias.map((k) => k.total_pedidos);
  } else {
    categoriasLabels = [];
    categoriasValores = [];
  }
  const totalPedidosCategoria = categoriasValores.reduce((sum, v) => sum + v, 0);
  const porcentagensCategoria = categoriasValores.map((v) =>
    totalPedidosCategoria > 0 ? Number(((v / totalPedidosCategoria) * 100).toFixed(2)) : 0
  );
  const categoriasColors = categoriasLabels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);

  // Estado chart — fallback com todos os estados brasileiros zerados
  // Mapeamento de regiões para ordenar estados por região e depois por nome
  const REGION_GROUPS: Record<number, string[]> = {
    0: ["Acre", "Amapá", "Amazonas", "Pará", "Rondônia", "Roraima", "Tocantins"], // Norte
    1: ["Alagoas", "Bahia", "Ceará", "Maranhão", "Paraíba", "Pernambuco", "Piauí", "Rio Grande do Norte", "Sergipe"], // Nordeste
    2: ["Distrito Federal", "Goiás", "Mato Grosso", "Mato Grosso do Sul"], // Centro-Oeste
    3: ["Espírito Santo", "Minas Gerais", "Rio de Janeiro", "São Paulo"], // Sudeste
    4: ["Paraná", "Rio Grande do Sul", "Santa Catarina"], // Sul
  };

  // build a lookup with normalized lowercase keys
  const REGION_MAP: Record<string, number> = Object.keys(REGION_GROUPS).reduce((acc, key) => {
    const idx = Number(key);
    REGION_GROUPS[idx].forEach((st) => {
      acc[st.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()] = idx;
    });
    return acc;
  }, {} as Record<string, number>);

  const getRegionIndex = (estadoName: string) => {
    const norm = estadoName ? estadoName.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase() : "";
    return REGION_MAP[norm] ?? 99;
  };

  let estadosLabels: string[] = [];
  let estadosValores: number[] = [];
  if (kpiEstado && kpiEstado.length > 0) {
    const sortedEstados = [...kpiEstado].sort((a, b) => {
      const ra = getRegionIndex(a.estado || "");
      const rb = getRegionIndex(b.estado || "");
      if (ra !== rb) return ra - rb;
      return (a.estado || "").localeCompare(b.estado || "", "pt-BR");
    });
    estadosLabels = sortedEstados.map((k) => k.estado);
    estadosValores = sortedEstados.map((k) => k.total_pedidos);
  } else {
    const sortedFallback = [...ESTADOS_FALLBACK].sort((a, b) => {
      const ra = getRegionIndex(a);
      const rb = getRegionIndex(b);
      if (ra !== rb) return ra - rb;
      return a.localeCompare(b, "pt-BR");
    });
    estadosLabels = sortedFallback;
    estadosValores = sortedFallback.map(() => 0);
  }
  const totalPedidosEstado = estadosValores.reduce((sum, v) => sum + v, 0);
  const porcentagensEstado = estadosValores.map((v) =>
    totalPedidosEstado > 0 ? Number(((v / totalPedidosEstado) * 100).toFixed(2)) : 0
  );
  // Agrupa estados da mesma região com cores semelhantes
  const REGION_BASE_HUES = [200, 20, 90, 260, 140]; // Norte, Nordeste, Centro-Oeste, Sudeste, Sul
  const normalizeKey = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  const estadosColors = estadosLabels.map((label, i) => {
    const normLabel = normalizeKey(label);
    let regionIdx = 99;
    let idxInRegion = 0;
    let regionCount = 1;
    for (const [rIdx, group] of Object.entries(REGION_GROUPS)) {
      const normalizedGroup = group.map((g) => normalizeKey(g));
      const found = normalizedGroup.indexOf(normLabel);
      if (found !== -1) {
        regionIdx = Number(rIdx);
        idxInRegion = found;
        regionCount = normalizedGroup.length;
        break;
      }
    }

    if (regionIdx === 99) {
      // estado não mapeado: espalha pelo círculo de matiz
      const hue = Math.round((i * 360) / estadosLabels.length);
      return `hsl(${hue}, 65%, 50%)`;
    }

    const baseHue = REGION_BASE_HUES[regionIdx] ?? Math.round((i * 360) / estadosLabels.length);
    // ligeiro deslocamento por posição no grupo para variação sutil
    const hueOffset = Math.round((idxInRegion / Math.max(1, regionCount)) * 18) - 9; // -9..+9
    const hue = (baseHue + hueOffset + 360) % 360;
    const saturation = 62;
    const lightness = 48 + Math.round((idxInRegion / Math.max(1, regionCount)) * 6); // pequenas variações
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  });

  const activeConfig = {
    status:    { labels, porcentagens: porcentagensStatus, colors, legend: labels },
    categoria: { labels: categoriasLabels, porcentagens: porcentagensCategoria, colors: categoriasColors, legend: categoriasLabels },
    estado:    { labels: estadosLabels,    porcentagens: porcentagensEstado,    colors: estadosColors,    legend: estadosLabels    },
  }[chartView];

  const dynamicBarData = {
    labels: activeConfig.labels,
    datasets: [{
      data: activeConfig.porcentagens,
      backgroundColor: activeConfig.colors,
      borderColor: "#ffffff",
      borderWidth: 1,
      borderRadius: { topLeft: 4, topRight: 4 },
      minBarLength: 5,
    }],
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
          ctx.fillText(
            Number(valor).toFixed(2).replace(".", ",") + "%",
            bar.x, bar.y - 5
          );
        });
      });
    },
  };

  const pluginTextoHorizontalEstado = {
    id: "textoHorizontalEstado",
    afterDatasetsDraw(chart: any) {
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);
      meta.data.forEach((bar: any, index: number) => {
        const valor = chart.data.datasets[0].data[index];
        ctx.fillStyle = "#4B5563";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(
          `${Number(valor).toFixed(2).replace(".", ",")}%`,
          bar.x + 6,
          bar.y
        );
      });
    },
  };

  // Satisfação
  const mesAtual = reviewData;
  const satisfacaoValores    = [mesAtual?.positiva ?? 0, mesAtual?.neutra ?? 0, mesAtual?.ruim ?? 0];
  const satisfacaoCores      = ["#5CA860", "#8A8D93", "#C64C4B"];
  const satisfacaoFundoCinza = satisfacaoValores.map((v) => 100 - v);
  const satisfacaoData = {
    labels: ["Positivo", "Neutro", "Negativo"],
    datasets: [
      { data: satisfacaoValores,    backgroundColor: satisfacaoCores, barThickness: 45 },
      { data: satisfacaoFundoCinza, backgroundColor: "#EBEDF0",       barThickness: 45 },
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

  // Entrega
  const mesAtualTicket  = ticketData;
  const totalEntregas   = (mesAtualTicket?.entrega_no_prazo ?? 0) + (mesAtualTicket?.entrega_atrasada ?? 0);
  const noPrazoPercent  = totalEntregas > 0 ? Math.round(((mesAtualTicket?.entrega_no_prazo  ?? 0) / totalEntregas) * 100) : 0;
  const atrasadoPercent = totalEntregas > 0 ? Math.round(((mesAtualTicket?.entrega_atrasada ?? 0) / totalEntregas) * 100) : 0;
  const noPrazo  = mesAtualTicket?.entrega_no_prazo  ?? 0;
  const atrasado = mesAtualTicket?.entrega_atrasada ?? 0;
  const semDados = noPrazo + atrasado === 0;

  const entregaData = {
    labels: ["No prazo", "Atrasado"],
    datasets: [{
      data: semDados ? [1] : [noPrazo, atrasado],
      backgroundColor: semDados ? ["#95959543", "#95959543"] : ["#5CA860", "#F47B20"],
      borderColor: "#ffffff",
      borderWidth: 2,
      cutout: "70%",
    }],
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
      ctx.fillText(new Intl.NumberFormat("pt-BR").format(totalEntregas), width / 2, height / 2 - 12);
      ctx.fillStyle = "#2B2B2B";
      ctx.font = "12px sans-serif";
      ctx.fillText("entregas", width / 2, height / 2 + 16);
      ctx.restore();
    },
  };

  const cardStyle = "bg-white border-2 border-black/10 rounded-2xl p-6 shadow-sm";

  // Altura dinâmica do gráfico de estado baseada na quantidade de itens
  const estadoChartHeight = Math.max(400, estadosLabels.length * 28);

  return (
    <div className="min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
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
              {["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"].map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
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
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array(3).fill(null).map((_, i) => (
                <div key={i} className="bg-white border-2 border-black/10 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                  <div className="h-4 w-2/5 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-3/5 bg-gray-300 rounded animate-pulse" />
                  <div className="h-3 w-2/5 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
            <div className="bg-white border-2 border-black/10 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div className="h-5 w-1/3 bg-gray-200 rounded animate-pulse" />
              <div className="h-[350px] bg-gray-100 rounded-xl animate-pulse" />
            </div>
            <div className="bg-white border-2 border-black/10 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div className="h-5 w-1/2 bg-gray-200 rounded animate-pulse" />
              <div className="h-[300px] bg-gray-100 rounded-xl animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array(2).fill(null).map((_, i) => (
                <div key={i} className="bg-white border-2 border-black/10 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                  <div className="h-5 w-2/5 bg-gray-200 rounded animate-pulse" />
                  <div className="h-[300px] bg-gray-100 rounded-xl animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="p-10 text-red-500 bg-white rounded-2xl border-2 border-red-200">
            Erro ao carregar dashboard: {error}
          </div>
        ) : (
          <>
            {/* KPI CARDS */}
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

            {/* LINE CHART */}
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

            {/* DYNAMIC BAR CHART */}
            <div className={`${cardStyle} mb-6`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-[#2B2B2B]">Distribuição de pedidos</h2>
                <div className="flex gap-2">
                  {(["status", "categoria", "estado"] as ChartView[]).map((view) => (
                    <button
                      key={view}
                      onClick={() => setChartView(view)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        chartView === view
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {view === "status" ? "Status" : view === "categoria" ? "Categoria" : "Estado"}
                    </button>
                  ))}
                </div>
              </div>

              {chartView === "estado" ? (
                <div style={{ height: `${estadoChartHeight}px` }}>
                  <Bar
                    key={`estado-${debouncedYear}-${debouncedMonth}`}
                    data={{
                      labels: activeConfig.labels,
                      datasets: [{
                        data: activeConfig.porcentagens,
                        backgroundColor: activeConfig.colors,
                        borderColor: "#ffffff",
                        borderWidth: 1,
                        borderRadius: { topLeft: 4, topRight: 4 },
                        minBarLength: 8,
                        barThickness: 14,
                      }],
                    }}
                    plugins={[pluginTextoHorizontalEstado]}
                    options={{
                      indexAxis: "y",
                      responsive: true,
                      maintainAspectRatio: false,
                      layout: { padding: { right: 60 } },
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: (context) => {
                              const v = Number(context.raw).toFixed(2).replace(".", ",");
                              return ` ${v}% dos pedidos`;
                            },
                          },
                        },
                      },
                      scales: {
                        x: {
                          min: 0,
                          max: 100,
                          ticks: { callback: (value) => `${value}%`, stepSize: 20 },
                          grid: { color: "#F3F4F6" },
                          border: { display: false },
                        },
                        y: {
                          grid: { display: false },
                          border: { display: true, color: "#9CA3AF" },
                          ticks: { font: { size: 11 } },
                        },
                      },
                    }}
                  />
                </div>
              ) : (
                <>
                  <div className="h-[300px]">
                    <Bar
                      key={`${chartView}-${debouncedYear}-${debouncedMonth}`}
                      data={dynamicBarData}
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
                                const v = Number(context.raw).toFixed(2).replace(".", ",");
                                return ` ${v}% dos pedidos`;
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

                  {/* Legenda centralizada com as barras */}
                  <div className="flex mt-4 border-t border-gray-100 pt-4">
                    {activeConfig.legend.map((label, i) => (
                      <div
                        key={label}
                        className="flex-1 flex flex-col items-center justify-start gap-1 text-sm font-medium text-gray-700"
                      >
                        {chartView === "status" ? (
                          getStatusIcon(label)
                        ) : (
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: activeConfig.colors[i] }}
                          />
                        )}
                        <span className="text-xs text-center leading-tight">
                          {chartView === "status" ? getStatusLabel(label) : label}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* BOTTOM CHARTS */}
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