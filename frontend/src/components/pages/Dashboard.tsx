import { useState, useEffect } from "react";
import {
  TrendingUp, TrendingDown, XCircle, CheckCircle2,
  AlertCircle, RotateCcw, Clock3, Package, ArrowUp, ArrowDown,
} from "lucide-react";

import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, ArcElement, BarElement, Tooltip, Legend, Filler,
} from "chart.js";

import { Line, Bar, Doughnut } from "react-chartjs-2";
import type { KpiStatusItem, MonthlyKpiItem } from "../../components/types/dashboard.types";
import {
  useKpiStatus, useMonthlyKpi, useMonthlyKpiForCards,
  useMonthlyKpiForCompPeriod, useMonthlyReview,
  useMonthlyTickets, useKpiCategoria, useKpiEstado,
} from "../../hooks/useDashboard";
import { PeriodPicker } from "../atoms/PeriodPicker";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, BarElement, Tooltip, Legend, Filler
);

const MESES_LABEL = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];
const MESES_SHORT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const STATUS_CONFIG = [
  { name: "recusado",    color: "#C62828", label: "Recusado"    },
  { name: "aprovado",    color: "#34A853", label: "Aprovado"    },
  { name: "reembolsado", color: "#E0A800", label: "Reembolsado" },
  { name: "processando", color: "#F63BDD", label: "Processando" },
  { name: "processado",  color: "#7C4DFF", label: "Processado"  },
];

const CHART_COLORS = [
  "#34A853","#3B6FF6","#7C4DFF","#F97316",
  "#C62828","#E0A800","#F63BDD","#06B6D4","#84CC16","#F43F5E",
];

const CATEGORIAS_FALLBACK = ["Automotivo","Beleza","Brinquedos","Casa","Eletronicos","Esportes","Moveis","Vestuario"];

const ESTADOS_FALLBACK = [
  "Acre","Alagoas","Amapá","Amazonas","Bahia","Ceará","Distrito Federal",
  "Espírito Santo","Goiás","Maranhão","Mato Grosso","Mato Grosso do Sul",
  "Minas Gerais","Pará","Paraíba","Paraná","Pernambuco","Piauí",
  "Rio de Janeiro","Rio Grande do Norte","Rio Grande do Sul","Rondônia",
  "Roraima","Santa Catarina","São Paulo","Sergipe","Tocantins",
];

const REGION_GROUPS: Record<number, string[]> = {
  0: ["Acre","Amapá","Amazonas","Pará","Rondônia","Roraima","Tocantins"],
  1: ["Alagoas","Bahia","Ceará","Maranhão","Paraíba","Pernambuco","Piauí","Rio Grande do Norte","Sergipe"],
  2: ["Distrito Federal","Goiás","Mato Grosso","Mato Grosso do Sul"],
  3: ["Espírito Santo","Minas Gerais","Rio de Janeiro","São Paulo"],
  4: ["Paraná","Rio Grande do Sul","Santa Catarina"],
};
const REGION_BASE_HUES = [200, 20, 90, 260, 140];
const normalizeKey = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
const REGION_MAP: Record<string, number> = Object.entries(REGION_GROUPS).reduce((acc, [idx, group]) => {
  group.forEach((st) => { acc[normalizeKey(st)] = Number(idx); });
  return acc;
}, {} as Record<string, number>);

type ChartView = "status" | "categoria" | "estado";

function toCompColor(color: string): string {
  if (color.startsWith("hsl(")) return color.replace("hsl(", "hsla(").replace(")", ", 0.45)");
  if (color.startsWith("#") && color.length === 7) return `${color}88`;
  return color;
}

function transformarStatus(data: KpiStatusItem[]) {
  const statusMap = new Map(data.map((item) => [item.status.toLowerCase(), item]));
  const orderedData = STATUS_CONFIG.map((config) => {
    const item = Array.from(statusMap.values()).find((d) => d.status.toLowerCase().includes(config.name));
    return { status: config.label, total_pedidos: item?.total_pedidos || 0, color: config.color };
  });
  return {
    labels: orderedData.map((i) => i.status),
    valores: orderedData.map((i) => i.total_pedidos),
    colors:  orderedData.map((i) => i.color),
  };
}

function getStatusIcon(status: string) {
  const n = status.toLowerCase();
  if (n.includes("recus"))       return <XCircle className="text-[#C62828]" size={18} />;
  if (n.includes("aprov"))       return <CheckCircle2 className="text-[#34A853]" size={18} />;
  if (n.includes("reembols"))    return <RotateCcw className="text-[#E0A800]" size={18} />;
  if (n.includes("processando")) return <Clock3 className="text-[#F63BDD]" size={18} />;
  if (n.includes("processado"))  return <Package className="text-[#7C4DFF]" size={18} />;
  return <Package className="text-gray-500" size={18} />;
}

function getStatusLabel(status: string) {
  return STATUS_CONFIG.find((c) => status.toLowerCase().includes(c.name))?.label || status;
}

// Calcula crescimento médio mensal (média das variações consecutivas)
function calcAvgMonthlyGrowth(values: number[]): number {
  if (values.length < 2) return 0;

  const first = values[0];
  var last = values[values.length - 1];

  console.log({ first, last, n: values.length - 1 });

  if (first <= 0) return 0;
  if (last <= 0) {
     last = values[values.length - 2] || first;
  };

  const n = values.length - 1;
  return (Math.pow(last / first, 1 / n) - 1) * 100;
}

// Encontra pico e baixa
function findPeakAndLow<T>(
  data: { value: number; label: string }[]
): { peak: T | null; low: T | null } {
  if (data.length === 0) return { peak: null, low: null };
  const peak = data.reduce((a, b) => b.value > a.value ? b : a);
  const low  = data.reduce((a, b) => b.value < a.value ? b : a);
  return { peak: peak as T, low: low as T };
}

interface CardMetrics {
  
  avgGrowth:    number;
  peak:         { value: number; label: string } | null;
  low:          { value: number; label: string } | null;
  prevTotal:    number | null;
  prevAvailable: boolean;
}

function Dashboard() {
  const currentYear  = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [startMonth, setStartMonth] = useState(currentMonth);
  const [startYear,  setStartYear]  = useState(currentYear);
  const [endMonth,   setEndMonth]   = useState(currentMonth);
  const [endYear,    setEndYear]    = useState(currentYear);

  const [dStartMonth, setDStartMonth] = useState(startMonth);
  const [dStartYear,  setDStartYear]  = useState(startYear);
  const [dEndMonth,   setDEndMonth]   = useState(endMonth);
  const [dEndYear,    setDEndYear]    = useState(endYear);

  const [compEnabled, setCompEnabled] = useState(false);
  const [compStartMonth, setCompStartMonth] = useState(startMonth);
  const [compStartYear,  setCompStartYear]  = useState(startYear - 1);
  const [compEndMonth,   setCompEndMonth]   = useState(endMonth);
  const [compEndYear,    setCompEndYear]    = useState(endYear - 1);

  const [chartView, setChartView] = useState<ChartView>("status");
  const [showDetailedCards, setShowDetailedCards] = useState(false);
  const [distChartArea, setDistChartArea] = useState<{ left: number; right: number } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDStartMonth(startMonth);
      setDStartYear(startYear);
      setDEndMonth(endMonth);
      setDEndYear(endYear);
    }, 300);
    return () => clearTimeout(timer);
  }, [startMonth, startYear, endMonth, endYear]);

  const periodoValido =
    dStartYear < dEndYear || (dStartYear === dEndYear && dStartMonth <= dEndMonth);

  const periodoLabel = `${MESES_LABEL[dStartMonth - 1]} ${dStartYear} → ${MESES_LABEL[dEndMonth - 1]} ${dEndYear}`;

  // Label do período anterior para exibição
  const prevPeriodLabel = `${MESES_LABEL[compStartMonth -1 ]}/${compStartYear} → ${MESES_LABEL[compEndMonth - 1]} ${compEndYear}`;
  // Hooks
  const { kpiData: kpiStatus, loading: loadingStatus, error: errorStatus } = useKpiStatus({
    anoInicio: dStartYear, mesInicio: dStartMonth,
    anoFim:    dEndYear,   mesFim:    dEndMonth,
    kpiType: "status",
  });
  const { data: monthlyData, loading: loadingMonthly, error: errorMonthly } =
    useMonthlyKpi(dStartYear, dStartMonth, dEndYear, dEndMonth);
  const { data: cardsData } =
    useMonthlyKpiForCards(dStartYear, dStartMonth, dEndYear, dEndMonth);
  const { data: prevData, available: prevAvailable } =
    useMonthlyKpiForCompPeriod(compStartYear, compStartMonth, compEndYear, compEndMonth);
  const { data: reviewData,  loading: loadingReview,  error: errorReview  } =
    useMonthlyReview(dStartYear, dStartMonth, dEndYear, dEndMonth);
  const { data: ticketData,  loading: loadingTicket,  error: errorTicket  } =
    useMonthlyTickets(dStartYear, dStartMonth, dEndYear, dEndMonth);
  const { data: kpiCategoria } = useKpiCategoria(dStartYear, dStartMonth, dEndYear, dEndMonth);
  const { data: kpiEstado    } = useKpiEstado(dStartYear, dStartMonth, dEndYear, dEndMonth);

  const { kpiData: kpiStatusComp    } = useKpiStatus({ anoInicio: compStartYear, mesInicio: compStartMonth, anoFim: compEndYear, mesFim: compEndMonth, kpiType: "status" });
  const { data:    kpiCategoriaComp } = useKpiCategoria(compStartYear, compStartMonth, compEndYear, compEndMonth);
  const { data:    kpiEstadoComp    } = useKpiEstado(compStartYear, compStartMonth, compEndYear, compEndMonth);
  const { data:    reviewComp       } = useMonthlyReview(compStartYear, compStartMonth, compEndYear, compEndMonth);
  const { data:    ticketComp       } = useMonthlyTickets(compStartYear, compStartMonth, compEndYear, compEndMonth);

  const loading = loadingStatus || loadingMonthly || loadingReview || loadingTicket;
  const error   = errorStatus  || errorMonthly  || errorReview  || errorTicket;

  // Gráfico de linha
  const monthLabels   = monthlyData?.map((item) => item.label) || [];
  const revenueValues = monthlyData?.map((item) => item.receita_total) || [];
  const compRevenueLabels = prevData.map((item) => item.label) || [];  
  const compRevenue = prevData.map((item) => item.receita_total);
  const firstLabel    = monthlyData?.[0]?.label ?? "";
  const isQuarterView = firstLabel.startsWith("Jan") || firstLabel.startsWith("Abr") ||
                        firstLabel.startsWith("Jul") || firstLabel.startsWith("Out")
                        ? false : /^\w{3}-\w{3}\/\d{2}$/.test(firstLabel);
  const isYearView    = /^\d{4}$/.test(firstLabel);

  // Totais do período
  const totalReceita = cardsData.reduce((s, i) => s + i.receita_total, 0);
  const totalPedidos = cardsData.reduce((s, i) => s + i.total_pedidos, 0);
  const ticketMedio  = totalPedidos > 0 ? totalReceita / totalPedidos : 0;

  // Totais do período anterior
  const prevTotalReceita = prevData.reduce((s, i) => s + i.receita_total, 0);
  const prevTotalPedidos = prevData.reduce((s, i) => s + i.total_pedidos, 0);
  const prevTicketMedio  = prevTotalPedidos > 0 ? prevTotalReceita / prevTotalPedidos : 0;

  const isSingleMonth = cardsData.length <= 1;

  // Métricas por card
  const receitaMetrics: CardMetrics = {
    avgGrowth: isSingleMonth ? 0 : calcAvgMonthlyGrowth(cardsData.map((d) => d.receita_total)),
    ...(() => {
      const { peak, low } = findPeakAndLow<{ value: number; label: string }>(
        cardsData.map((d, i) => ({
          value: d.receita_total,
          label: `${MESES_SHORT[
            new Date(dStartYear, dStartMonth - 1 + i).getMonth()
          ]}/${String(new Date(dStartYear, dStartMonth - 1 + i).getFullYear()).slice(-2)}`,
        }))
      );
      return { peak, low };
    })(),
    prevTotal:    prevAvailable ? prevTotalReceita : null,
    prevAvailable,
  };

  const pedidosMetrics: CardMetrics = {
    avgGrowth: isSingleMonth ? 0 : calcAvgMonthlyGrowth(cardsData.map((d) => d.total_pedidos)),
    ...(() => {
      const { peak, low } = findPeakAndLow<{ value: number; label: string }>(
        cardsData.map((d, i) => ({
          value: d.total_pedidos,
          label: `${MESES_SHORT[
            new Date(dStartYear, dStartMonth - 1 + i).getMonth()
          ]}/${String(new Date(dStartYear, dStartMonth - 1 + i).getFullYear()).slice(-2)}`,
        }))
      );
      return { peak, low };
    })(),
    prevTotal:    prevAvailable ? prevTotalPedidos : null,
    prevAvailable,
  };

  const ticketMetrics: CardMetrics = {
    avgGrowth: isSingleMonth ? 0 : calcAvgMonthlyGrowth(cardsData.map((d) => d.ticket_medio)),
    ...(() => {
      const { peak, low } = findPeakAndLow<{ value: number; label: string }>(
        cardsData.map((d, i) => ({
          value: d.ticket_medio,
          label: `${MESES_SHORT[
            new Date(dStartYear, dStartMonth - 1 + i).getMonth()
          ]}/${String(new Date(dStartYear, dStartMonth - 1 + i).getFullYear()).slice(-2)}`,
        }))
      );
      return { peak, low };
    })(),
    prevTotal:    prevAvailable ? prevTicketMedio : null,
    prevAvailable,
  };

  const calcGrowthVsPrev = (current: number, prev: number) => {
    if (!prev || prev === 0) return 0;
    return ((current - prev) / prev) * 100;
  };


const revenueData = {
  labels: compEnabled
    ? monthLabels.map((label, index) => `${label}${compRevenueLabels[index] ? `\n${compRevenueLabels[index]}` : ""}`)
    : monthLabels,
  datasets: [
    {
      label: "Receita",
      data: revenueValues,
      borderColor: "#8B7CF8",
      backgroundColor: "rgba(139,124,248,0.18)",
      fill: true,
      tension: 0.45,
      pointRadius: 3,
      pointBackgroundColor: "#8B7CF8",
      borderWidth: 1,
    },
    ...(compEnabled ? [{
      label: "Receita anterior",
      data: compRevenue,
      borderColor: "#f87c7c",
      backgroundColor: "rgba(248,124,124,0.18)",
      fill: true,
      tension: 0.45,
      pointRadius: 3,
      pointBackgroundColor: "#f87c7c",
      borderWidth: 1,
    }] : []),
  ]
};


  // Status chart
  const statusData = (kpiStatus || []) as KpiStatusItem[];
  const { labels, valores, colors } = transformarStatus(statusData);
  const totalPedidosStatus = valores.reduce((s, v) => s + v, 0);
  const porcentagensStatus = valores.map((v) =>
    totalPedidosStatus > 0 ? Number(((v / totalPedidosStatus) * 100).toFixed(2)) : 0
  );

  // Categoria chart
  const sortedCategorias = kpiCategoria.length > 0
    ? [...kpiCategoria].sort((a, b) => a.categoria.localeCompare(b.categoria, "pt-BR"))
    : CATEGORIAS_FALLBACK.map((c) => ({ categoria: c, total_pedidos: 0, receita_total: 0 }));
  const categoriasLabels  = sortedCategorias.map((k) => k.categoria);
  const categoriasValores = sortedCategorias.map((k) => k.total_pedidos);
  const totalPedidosCategoria = categoriasValores.reduce((s, v) => s + v, 0);
  const porcentagensCategoria = categoriasValores.map((v) =>
    totalPedidosCategoria > 0 ? Number(((v / totalPedidosCategoria) * 100).toFixed(2)) : 0
  );
  const categoriasColors = categoriasLabels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);

  // Estado chart
  const getRegionIndex = (name: string) => REGION_MAP[normalizeKey(name)] ?? 99;
  const sortedEstados = kpiEstado.length > 0
    ? [...kpiEstado].sort((a, b) => {
        const ra = getRegionIndex(a.estado || "");
        const rb = getRegionIndex(b.estado || "");
        if (ra !== rb) return ra - rb;
        return (a.estado || "").localeCompare(b.estado || "", "pt-BR");
      })
    : ESTADOS_FALLBACK.map((e) => ({ estado: e, total_pedidos: 0, receita_total: 0 }));
  const estadosLabels  = sortedEstados.map((k) => k.estado);
  const estadosValores = sortedEstados.map((k) => k.total_pedidos);
  const totalPedidosEstado = estadosValores.reduce((s, v) => s + v, 0);
  const porcentagensEstado = estadosValores.map((v) =>
    totalPedidosEstado > 0 ? Number(((v / totalPedidosEstado) * 100).toFixed(2)) : 0
  );
  const estadosColors = estadosLabels.map((label, i) => {
    const normLabel = normalizeKey(label);
    let regionIdx = 99; let idxInRegion = 0; let regionCount = 1;
    for (const [rIdx, group] of Object.entries(REGION_GROUPS)) {
      const ng    = group.map((g) => normalizeKey(g));
      const found = ng.indexOf(normLabel);
      if (found !== -1) { regionIdx = Number(rIdx); idxInRegion = found; regionCount = ng.length; break; }
    }
    if (regionIdx === 99) return `hsl(${Math.round((i * 360) / estadosLabels.length)}, 65%, 50%)`;
    const baseHue   = REGION_BASE_HUES[regionIdx];
    const hueOffset = Math.round((idxInRegion / Math.max(1, regionCount)) * 18) - 9;
    const lightness = 48 + Math.round((idxInRegion / Math.max(1, regionCount)) * 6);
    return `hsl(${(baseHue + hueOffset + 360) % 360}, 62%, ${lightness}%)`;
  });

  const { valores: valoresStatusComp } = transformarStatus((kpiStatusComp || []) as KpiStatusItem[]);
  const totalStatusComp = valoresStatusComp.reduce((s, v) => s + v, 0);
  const porcentagensStatusComp = valoresStatusComp.map((v) =>
    totalStatusComp > 0 ? Number(((v / totalStatusComp) * 100).toFixed(2)) : 0
  );

  const totalCategoriasComp = kpiCategoriaComp.reduce((s, c) => s + c.total_pedidos, 0);
  const porcentagensCategoriasComp = categoriasLabels.map((cat) => {
    const match = kpiCategoriaComp.find((c) => c.categoria === cat);
    return match && totalCategoriasComp > 0
      ? Number(((match.total_pedidos / totalCategoriasComp) * 100).toFixed(2))
      : 0;
  });

  const totalEstadosComp = kpiEstadoComp.reduce((s, e) => s + e.total_pedidos, 0);
  const porcentagensEstadoComp = estadosLabels.map((est) => {
    const match = kpiEstadoComp.find((e) => e.estado === est);
    return match && totalEstadosComp > 0
      ? Number(((match.total_pedidos / totalEstadosComp) * 100).toFixed(2))
      : 0;
  });

  const activeConfig = {
    status:    { labels, porcentagens: porcentagensStatus, colors, legend: labels, compPorcentagens: porcentagensStatusComp },
    categoria: { labels: categoriasLabels, porcentagens: porcentagensCategoria, colors: categoriasColors, legend: categoriasLabels, compPorcentagens: porcentagensCategoriasComp },
    estado:    { labels: estadosLabels,    porcentagens: porcentagensEstado,    colors: estadosColors,    legend: estadosLabels,    compPorcentagens: porcentagensEstadoComp },
  }[chartView];

  const dynamicBarData = {
    labels: activeConfig.labels,
    datasets: [
      {
        label: "Período atual",
        data: activeConfig.porcentagens,
        backgroundColor: activeConfig.colors,
        borderColor: "#ffffff", borderWidth: 1,
        borderRadius: { topLeft: 4, topRight: 4 }, minBarLength: 5,
      },
      ...(compEnabled ? [{
        label: "Comparativo",
        data: activeConfig.compPorcentagens,
        backgroundColor: activeConfig.colors.map(toCompColor),
        borderColor: "#ffffff", borderWidth: 1,
        borderRadius: { topLeft: 4, topRight: 4 }, minBarLength: 5,
      }] : []),
    ],
  };

  const pluginPorcentagemNoTopo = {
    id: "porcentagemNoTopo",
    afterDatasetsDraw(chart: any) {
      const { ctx } = chart;
      chart.getDatasetMeta(0).data.forEach((bar: any, index: number) => {
        const valor = chart.data.datasets[0].data[index];
        ctx.fillStyle = "#4B5563"; ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "bottom";
        ctx.fillText(Number(valor).toFixed(2).replace(".", ",") + "%", bar.x, bar.y - 5);
      });
      if (compEnabled && chart.getDatasetMeta(1)?.data) {
        chart.getDatasetMeta(1).data.forEach((bar: any, index: number) => {
          const valor = chart.data.datasets[1].data[index];
          ctx.fillStyle = "#9CA3AF"; ctx.font = "11px sans-serif";
          ctx.textAlign = "center"; ctx.textBaseline = "bottom";
          ctx.fillText(Number(valor).toFixed(2).replace(".", ",") + "%", bar.x, bar.y - 5);
        });
      }
    },
  };

  const pluginSyncDistArea = {
    id: "syncDistArea",
    afterLayout(chart: any) {
      if (!chart.chartArea) return;
      const left = chart.chartArea.left;
      const right = chart.width - chart.chartArea.right;
      setDistChartArea((prev) => {
        if (prev && Math.abs(prev.left - left) < 0.5 && Math.abs(prev.right - right) < 0.5) {
          return prev;
        }
        return { left, right };
      });
    },
  };

  const pluginTextoHorizontalEstado = {
    id: "textoHorizontalEstado",
    afterDatasetsDraw(chart: any) {
      const { ctx } = chart;
      chart.getDatasetMeta(0).data.forEach((bar: any, index: number) => {
        const valor = chart.data.datasets[0].data[index] as number;
        const mainText = `${Number(valor).toFixed(2).replace(".", ",")}%`;
        ctx.fillStyle = "#4B5563"; ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "left"; ctx.textBaseline = "middle";
        ctx.fillText(mainText, bar.x + 6, bar.y);
        if (compEnabled && porcentagensEstadoComp[index] !== undefined) {
          const compVal = porcentagensEstadoComp[index];
          const delta = Number(valor) - compVal;
          const rounded = parseFloat(delta.toFixed(1));
          const mainWidth = ctx.measureText(mainText).width;
          const sign = rounded > 0 ? "+" : "";
          const deltaText = rounded === 0
            ? " (= igual)"
            : ` (${sign}${rounded.toFixed(1).replace(".", ",")}pp)`;
          ctx.fillStyle = rounded > 0 ? "#16a34a" : rounded < 0 ? "#dc2626" : "#9CA3AF";
          ctx.font = "10px sans-serif";
          ctx.fillText(deltaText, bar.x + 6 + mainWidth, bar.y);
        }
      });
    },
  };

  // Satisfação
  const positiva = reviewData?.positiva ?? 0;
  const negativa  = reviewData?.ruim    ?? 0;
  const neutra    = reviewData?.neutra  ?? 0;
  const vazio     = positiva + neutra + negativa === 0;

  const positivaComp = reviewComp?.positiva ?? 0;
  const negativaComp = reviewComp?.ruim     ?? 0;
  const neutraComp   = reviewComp?.neutra   ?? 0;
  const vazioComp    = positivaComp + neutraComp + negativaComp === 0;

  const satisfacaoData = {
    labels: ["Positivo", "Neutro", "Negativo"],
    datasets: [
      {
        label: "Período atual",
        data: vazio ? [0.75, 0.75, 0.75] : [positiva, neutra, negativa],
        backgroundColor: ["#5CA860", "#8A8D93", "#C64C4B"],
        barThickness: compEnabled ? 22 : 45,
      },
      ...(compEnabled ? [{
        label: "Comparativo",
        data: vazioComp ? [0.75, 0.75, 0.75] : [positivaComp, neutraComp, negativaComp],
        backgroundColor: ["#5CA86088", "#8A8D9388", "#C64C4B88"],
        barThickness: 22,
      }] : []),
    ],
  };

  const pluginTextoHorizontal = {
    id: "textoHorizontal",
    afterDatasetsDraw(chart: any) {
      const { ctx } = chart;
      chart.getDatasetMeta(0).data.forEach((bar: any, index: number) => {
        const valor = chart.data.datasets[0].data[index];
        ctx.fillStyle = "#4B5563"; ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "left"; ctx.textBaseline = "middle";
        ctx.fillText(vazio ? "0%" : `${valor}%`, bar.x + 8, bar.y);
      });
      if (compEnabled) {
        chart.getDatasetMeta(1).data.forEach((bar: any, index: number) => {
          const valor = chart.data.datasets[1].data[index];
          ctx.fillStyle = "#9CA3AF"; ctx.font = "12px sans-serif";
          ctx.textAlign = "left"; ctx.textBaseline = "middle";
          ctx.fillText(vazioComp ? "0%" : `${valor}%`, bar.x + 8, bar.y);
        });
      }
    },
  };

  // Entrega
  const noPrazo         = ticketData?.entrega_no_prazo  ?? 0;
  const atrasado        = ticketData?.entrega_atrasada  ?? 0;
  const totalEntregas   = noPrazo + atrasado;
  const noPrazoPercent  = totalEntregas > 0 ? Number((noPrazo  / totalEntregas) * 100).toFixed(2).replace(".", ",") : "0";
  const atrasadoPercent = totalEntregas > 0 ? Number((atrasado / totalEntregas) * 100).toFixed(2).replace(".", ",") : "0";
  const semDados        = totalEntregas === 0;

  const noPrazoComp     = ticketComp?.entrega_no_prazo ?? 0;
  const atrasadoComp    = ticketComp?.entrega_atrasada ?? 0;
  const totalEntregasComp = noPrazoComp + atrasadoComp;
  const noPrazoPercentComp  = totalEntregasComp > 0 ? Number((noPrazoComp  / totalEntregasComp) * 100).toFixed(2).replace(".", ",") : "0";
  const atrasadoPercentComp = totalEntregasComp > 0 ? Number((atrasadoComp / totalEntregasComp) * 100).toFixed(2).replace(".", ",") : "0";
  const semDadosComp        = totalEntregasComp === 0;

  const noPrazoDelta  = totalEntregas > 0 && totalEntregasComp > 0
    ? Number(((noPrazo / totalEntregas) - (noPrazoComp / totalEntregasComp)) * 100)
    : null;
  const atrasadoDelta = totalEntregas > 0 && totalEntregasComp > 0
    ? Number(((atrasado / totalEntregas) - (atrasadoComp / totalEntregasComp)) * 100)
    : null;

  const entregaData = {
    labels: ["No prazo", "Atrasado"],
    datasets: [{
      data: semDados ? [1] : [noPrazo, atrasado],
      backgroundColor: semDados ? ["#95959543","#95959543"] : ["#5CA860","#F47B20"],
      borderColor: "#ffffff", borderWidth: 2, cutout: "70%",
    }],
  };

  const entregaDataComp = {
    labels: ["No prazo", "Atrasado"],
    datasets: [{
      data: semDadosComp ? [1] : [noPrazoComp, atrasadoComp],
      backgroundColor: semDadosComp ? ["#95959543","#95959543"] : ["#5CA860","#F47B20"],
      borderColor: "#ffffff", borderWidth: 2, cutout: "70%",
    }],
  };

  const pluginTextoCentralRosca = {
    id: "textoCentralRosca",
    beforeDraw(chart: any) {
      const { ctx, width, height } = chart;
      ctx.save();
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#2B2B2B"; ctx.font = "bold 24px sans-serif";
      ctx.fillText(new Intl.NumberFormat("pt-BR").format(totalEntregas), width / 2, height / 2 - 12);
      ctx.font = "12px sans-serif";
      ctx.fillText("entregas", width / 2, height / 2 + 16);
      ctx.restore();
    },
  };

  const pluginTextoCentralRoscaComp = {
    id: "textoCentralRoscaComp",
    beforeDraw(chart: any) {
      const { ctx, width, height } = chart;
      ctx.save();
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#2B2B2B"; ctx.font = "bold 24px sans-serif";
      ctx.fillText(new Intl.NumberFormat("pt-BR").format(totalEntregasComp), width / 2, height / 2 - 12);
      ctx.font = "12px sans-serif";
      ctx.fillText("entregas", width / 2, height / 2 + 16);
      ctx.restore();
    },
  };

useEffect(() => {
  if (!compEnabled) {
    setCompStartMonth(dStartMonth);
    setCompStartYear(dStartYear - 1);
    setCompEndMonth(dEndMonth);
    setCompEndYear(dEndYear - 1);
  }
}, [dStartMonth, dStartYear, dEndMonth, dEndYear, compEnabled]);

  // Componente de card com as 3 métricas
  const KpiCard = ({
    label, value, metrics, currentTotal, formatValue, detailed,
  }: {
    label: string;
    value: string;
    metrics: CardMetrics;
    currentTotal: number;
    formatValue: (v: number) => string;
    detailed: boolean;
  }) => (
    <div className={cardStyle}>
      <p className="text-sm text-[#333] font-medium mb-3">{label}</p>
      <h2 className="text-3xl font-black text-[#2E2E2E] mb-4">{value}</h2>

      {detailed && (
        isSingleMonth ? (
          <p className="text-xs text-gray-400 font-medium">Período único — sem comparativo</p>
        ) : (
          <div className="flex flex-col gap-2">

            <div className={`flex items-center gap-1.5 text-xs font-medium ${metrics.avgGrowth >= 0 ? "text-green-600" : "text-red-500"}`}>
              {metrics.avgGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{Math.abs(metrics.avgGrowth).toFixed(1)}% ao mês em média</span>
            </div>

            {metrics.peak && metrics.low && metrics.peak.label !== metrics.low.label && (
              <div className="flex flex-col gap-1 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full border border-green-300 bg-green-50 flex items-center justify-center shrink-0">
                    <ArrowUp size={11} className="text-green-500" />
                  </div>
                  <span>Pico {metrics.peak.label} · <span className="font-semibold text-gray-700">{formatValue(metrics.peak.value)}</span></span>
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full border border-red-300 bg-red-50 flex items-center justify-center shrink-0">
                    <ArrowDown size={11} className="text-red-400" />
                  </div>
                  <span>Baixa {metrics.low.label} · <span className="font-semibold text-gray-700">{formatValue(metrics.low.value)}</span></span>
                </span>
              </div>
            )}

            {metrics.prevAvailable && metrics.prevTotal !== null ? (
              (() => {
                const growth = calcGrowthVsPrev(currentTotal, metrics.prevTotal);
                return (
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${growth >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {growth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {compEnabled ? (
                        <span>
                          {Math.abs(growth).toFixed(1)}% vs período comparado ({prevPeriodLabel})
                        </span>
                      ) : (
                        <span>
                          {Math.abs(growth).toFixed(1)}% vs período equivalente ({prevPeriodLabel})
                        </span>
                      )}
                  </div>
                );
              })()
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <span>⚠️</span>
                <span>Sem dados para período equivalente anterior</span>
              </div>
            )}

          </div>
        )
      )}
    </div>
  );

  const cardStyle = "bg-white border-2 border-black/10 rounded-2xl p-6 shadow-sm";
  const estadoChartHeight = Math.max(400, estadosLabels.length * 28);

  return (
    <div className="min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-[#2B2B2B]">Dashboard</h1>
             { !compEnabled ? (<p className="text-blue-600 font-semibold mt-1">Filtragem: {periodoLabel} </p>) : (<><p className="text-blue-600 font-semibold mt-1">Filtragem: {periodoLabel}</p> <p className="text-purple-600 font-semibold mt-1">Comparação: {prevPeriodLabel} </p></>)  }
            <p className="text-sm text-gray-500 mt-0.5">CRM 360 visão geral do período</p>
          </div>
          <PeriodPicker
            startMonth={startMonth} startYear={startYear}
            endMonth={endMonth}     endYear={endYear}
            onStartChange={(m, y) => { setStartMonth(m); setStartYear(y); }}
            onEndChange={(m, y)   => { setEndMonth(m);   setEndYear(y);   }}

            compEnabled={compEnabled}
            onCompToggle={setCompEnabled}
            compStartMonth={compStartMonth} compStartYear={compStartYear}
            compEndMonth={compEndMonth}     compEndYear={compEndYear}
            onCompStartChange={(m, y) => { setCompStartMonth(m); setCompStartYear(y); }}
            onCompEndChange={(m, y)   => { setCompEndMonth(m);   setCompEndYear(y);   }}
            minYear={2023}
            maxYear={currentYear}
          />
        </div>

        {!periodoValido ? (
          <div className="p-6 text-red-500 bg-white rounded-2xl border-2 border-red-200 text-sm">
            Selecione um período válido para visualizar os dados.
          </div>
        ) : loading ? (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array(3).fill(null).map((_, i) => (
                <div key={i} className="bg-white border-2 border-black/10 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                  <div className="h-4 w-2/5 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-3/5 bg-gray-300 rounded animate-pulse" />
                  <div className="h-3 w-2/5 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-3/5 bg-gray-200 rounded animate-pulse" />
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
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-500">Métricas principais</span>
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full p-1.5">
                {([["resumo", "Resumo"], ["detalhado", "Cards detalhados"]] as const).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setShowDetailedCards(key === "detalhado")}
                    className={[
                      "rounded-full px-5 py-1.5 text-sm font-medium transition-all duration-150 cursor-pointer",
                      (key === "detalhado") === showDetailedCards
                        ? "bg-blue-500 text-white shadow-sm"
                        : "text-gray-400 hover:text-gray-600",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <KpiCard
                label="Receita total do período"
                value={new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalReceita)}
                metrics={receitaMetrics}
                currentTotal={totalReceita}
                formatValue={(v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)}
                detailed={showDetailedCards}
              />
              <KpiCard
                label="Total de pedidos do período"
                value={new Intl.NumberFormat("pt-BR").format(totalPedidos)}
                metrics={pedidosMetrics}
                currentTotal={totalPedidos}
                formatValue={(v) => new Intl.NumberFormat("pt-BR").format(v)}
                detailed={showDetailedCards}
              />
              <KpiCard
                label="Ticket médio do período"
                value={new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(ticketMedio)}
                metrics={ticketMetrics}
                currentTotal={ticketMedio}
                formatValue={(v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)}
                detailed={showDetailedCards}
              />
            </div>

            {/* LINE CHART */}
            <div className={`${cardStyle} mb-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#2B2B2B]">Receita ao longo do período</h2>
                {isQuarterView && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    Agrupado por trimestre — período entre 13 e 36 meses
                  </span>
                )}
                {isYearView && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    Agrupado por ano — período acima de 36 meses
                  </span>
                )}
              </div>
              <div className="h-[350px]">
                <Line
                  data={revenueData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                            legend: {
                              display: compEnabled,
                              position: "top",
                              labels: {
                                color: "black",
                                boxWidth: 12,
                                padding: 16,
                                font: {
                                  size: 12,
                                },
                              },
                            },
                          },
                    scales: {
                      x: { grid: { display: false } },
                      y: { beginAtZero: true, grid: { color: "#F3F4F6" }, border: { display: false } },
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
                        chartView === view ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {view === "status" ? "Status" : view === "categoria" ? "Categoria" : "Estado"}
                    </button>
                  ))}
                </div>
              </div>

              {chartView === "estado" ? (
                <>
                <div style={{ height: `${estadoChartHeight}px` }}>
                  <Bar
                    key={`estado-${dStartYear}-${dStartMonth}-${dEndYear}-${dEndMonth}-${compEnabled}-${compStartYear}-${compStartMonth}`}
                    data={{
                      labels: activeConfig.labels,
                      datasets: [{
                        data: activeConfig.porcentagens,
                        backgroundColor: activeConfig.colors,
                        borderColor: "#ffffff", borderWidth: 1,
                        borderRadius: { topLeft: 4, topRight: 4 },
                        minBarLength: 8, barThickness: 14,
                      }],
                    }}
                    plugins={[pluginTextoHorizontalEstado]}
                    options={{
                      indexAxis: "y", responsive: true, maintainAspectRatio: false,
                      layout: { padding: { right: compEnabled ? 130 : 60 } },
                      plugins: {
                        legend: { display: false },
                        tooltip: { callbacks: { label: (ctx) => ` ${Number(ctx.raw).toFixed(2).replace(".", ",")}% dos pedidos` } },
                      },
                      scales: {
                        x: { min: 0, max: 100, ticks: { callback: (v) => `${v}%`, stepSize: 20 }, grid: { color: "#F3F4F6" }, border: { display: false } },
                        y: { grid: { display: false }, border: { display: true, color: "#9CA3AF" }, ticks: { font: { size: 11 } } },
                      },
                    }}
                  />
                </div>
                {compEnabled && (
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 flex-wrap">
                    <span className="font-medium text-gray-600">Variação vs comparativo:</span>
                    <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-green-600" /> Cresceu</span>
                    <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" /> Reduziu</span>
                    <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-gray-400" /> Sem variação</span>
                    <span className="text-gray-400 ml-1">· pp = pontos percentuais</span>
                  </div>
                )}
                </>
              ) : (
                <>
                  <div className={compEnabled ? "h-[340px]" : "h-[300px]"}>
                    <Bar
                      key={`${chartView}-${dStartYear}-${dStartMonth}-${dEndYear}-${dEndMonth}-${compEnabled}-${compStartYear}-${compStartMonth}`}
                      data={dynamicBarData}
                      plugins={[pluginPorcentagemNoTopo, pluginSyncDistArea]}
                      options={{
                        responsive: true, maintainAspectRatio: false,
                        layout: { padding: { top: 20 } },
                        plugins: {
                          legend: {
                            display: false,
                            labels: { usePointStyle: true, pointStyle: "rect" as const, boxWidth: 12, font: { size: 11 }, color: "#4B5563" },
                          },
                          tooltip: { callbacks: { label: (ctx) => ` ${Number(ctx.raw).toFixed(2).replace(".", ",")}% dos pedidos` } },
                        },
                        scales: {
                          x: { display: false },
                          y: {
                            display: true,
                            min: 0,
                            max: 100,
                            ticks: { callback: (v) => `${v}%`, stepSize: 20, font: { size: 11 }, color: "#6B7280" },
                            grid: { color: "#F3F4F6" },
                            border: { display: false },
                          },
                        },
                      }}
                    />
                  </div>
                  <div
                    className="flex mt-4 border-t border-gray-100 pt-4"
                    style={{
                      paddingLeft:  distChartArea?.left  ?? 0,
                      paddingRight: distChartArea?.right ?? 0,
                    }}
                  >
                    {activeConfig.legend.map((label, i) => (
                      <div key={label} className="flex-1 flex flex-col items-center gap-1 font-medium text-gray-700">
                        {chartView === "status" ? getStatusIcon(label) : (
                          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: activeConfig.colors[i] }} />
                        )}
                        <span className="text-xs text-center leading-tight">
                          {chartView === "status" ? getStatusLabel(label) : label}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <div className="flex item-end justify-end">
            {compEnabled && chartView != "estado" && (
                <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>As cores vibrantes indicam o <span className="font-semibold text-blue-600">periodo principal</span> enquanto as translucidas <span className="font-semibold text-purple-500">o periodo comparativo</span>.</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                  </div>
                </div>
              )}
              </div>
            </div>

            {/* BOTTOM CHARTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={cardStyle}>
                <h2 className="text-xl font-bold text-[#2B2B2B] mb-6">Taxa de satisfação dos produtos</h2>
                <div className={compEnabled ? "h-[340px]" : "h-[300px]"}>
                  <Bar
                    key={`satisfacao-${dStartYear}-${dStartMonth}-${dEndYear}-${dEndMonth}-${compEnabled}-${compStartYear}-${compStartMonth}`}
                    data={satisfacaoData}
                    plugins={[pluginTextoHorizontal]}
                    options={{
                      indexAxis: "y", responsive: true, maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                          labels: { usePointStyle: true, pointStyle: "rect" as const, boxWidth: 12, font: { size: 11 }, color: "#4B5563" },
                        },
                        tooltip: { enabled: false },
                      },
                      scales: {
                        x: { position: "top", min: 0, max: 100, ticks: { callback: (v) => `${v}%`, stepSize: 20 }, grid: { color: "#F3F4F6" }, border: { display: false } },
                        y: { grid: { display: false }, border: { display: true, color: "#9CA3AF" } },
                      },
                    }}
                  />
              </div>

            {compEnabled && (
                              <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                  <span>As cores vibrantes indicam o <span className="font-semibold text-blue-600">periodo principal</span> enquanto as translucidas <span className="font-semibold text-purple-500">o periodo comparativo</span>.</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                                </div>
                              </div>
                            )}
              </div>
              <div className={`${cardStyle} flex flex-col`}>
                <h2 className="text-xl font-bold text-[#2B2B2B] mb-6">Indicador de entrega</h2>

                {compEnabled ? (
                  <div className="flex-1 flex items-center justify-center gap-4">
                    {/* Doughnut — Período atual */}
                    <div className="flex-1 flex flex-col items-center">
                      <span className="text-xs font-semibold text-blue-600 mb-2">Período atual</span>
                      <div className="h-[190px] w-full">
                        <Doughnut
                          key={`entrega-atual-${dStartYear}-${dStartMonth}-${dEndYear}-${dEndMonth}`}
                          data={entregaData}
                          plugins={[pluginTextoCentralRosca]}
                          options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } } }}
                        />
                      </div>
                      {/* Delta fica aqui: atual vs comparativo */}
                      <div className="flex flex-col items-center gap-1.5 mt-3 text-xs text-gray-600">
                        <div className="flex items-center gap-1.5 flex-wrap justify-center">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#5CA860] flex-shrink-0" />
                          <span className="font-medium">No prazo {noPrazoPercent}%</span>
                          {noPrazoDelta !== null && (
                            <span className={`font-semibold ${noPrazoDelta >= 0 ? "text-green-600" : "text-red-500"}`}>
                              ({noPrazoDelta >= 0 ? "+" : ""}{noPrazoDelta.toFixed(1).replace(".", ",")}pp)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap justify-center">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#F47B20] flex-shrink-0" />
                          <span className="font-medium">Atrasado {atrasadoPercent}%</span>
                          {atrasadoDelta !== null && (
                            <span className={`font-semibold ${atrasadoDelta <= 0 ? "text-green-600" : "text-red-500"}`}>
                              ({atrasadoDelta >= 0 ? "+" : ""}{atrasadoDelta.toFixed(1).replace(".", ",")}pp)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Divisor */}
                    <div className="w-px bg-gray-100 self-stretch" />

                    {/* Doughnut — Comparativo (só valores, sem delta) */}
                    <div className="flex-1 flex flex-col items-center">
                      <span className="text-xs font-semibold text-gray-400 mb-2">Comparativo</span>
                      <div className="h-[190px] w-full">
                        <Doughnut
                          key={`entrega-comp-${compStartYear}-${compStartMonth}-${compEndYear}-${compEndMonth}`}
                          data={entregaDataComp}
                          plugins={[pluginTextoCentralRoscaComp]}
                          options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } } }}
                        />
                      </div>
                      <div className="flex flex-col items-center gap-1.5 mt-3 text-xs text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#5CA860] flex-shrink-0" />
                          <span className="font-medium">No prazo {noPrazoPercentComp}%</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#F47B20] flex-shrink-0" />
                          <span className="font-medium">Atrasado {atrasadoPercentComp}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="h-[250px]">
                      <Doughnut
                        key={`entrega-${dStartYear}-${dStartMonth}-${dEndYear}-${dEndMonth}-${totalEntregas}`}
                        data={entregaData}
                        plugins={[pluginTextoCentralRosca]}
                        options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } } }}
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
                )}
                {compEnabled && (
                  <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>O delta ao lado do <span className="font-semibold text-blue-600">Período atual</span> mostra a variação em relação ao <span className="font-semibold text-gray-500">Comparativo</span>.</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                      <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-green-600" /> Melhorou</span>
                      <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" /> Piorou</span>
                      <span className="text-gray-400">· pp = pontos percentuais</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;