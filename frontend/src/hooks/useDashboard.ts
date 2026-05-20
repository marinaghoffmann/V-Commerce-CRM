import api from "../services/api";
import { useEffect, useState } from "react";
import type {
  KpiStatusItem,
  KpiStateItem,
  KpiCategoryItem,
  MonthlyReviewProcessed,
  MonthlyTicketsProcessed,
} from "../components/types/dashboard.types";

interface PeriodoArgs {
  anoInicio: number;
  mesInicio: number;
  anoFim: number;
  mesFim: number;
}

interface UseKpiStatusArgs extends PeriodoArgs {
  kpiType: "status" | "state" | "category";
}

export function useKpiStatus({ anoInicio, mesInicio, anoFim, mesFim, kpiType }: UseKpiStatusArgs) {
  const [kpiData, setKpiData] = useState<KpiCategoryItem[] | KpiStateItem[] | KpiStatusItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page:        "1",
      limit:       "500",
      ano_inicio:  String(anoInicio),
      mes_inicio:  String(mesInicio),
      ano_fim:     String(anoFim),
      mes_fim:     String(mesFim),
    });

    api
      .get(`/kpi-${kpiType}?${params.toString()}`)
      .then((res) => setKpiData(res.data))
      .catch((err) => { setKpiData([]); setError(err.message ?? String(err)); })
      .finally(() => setLoading(false));
  }, [anoInicio, mesInicio, anoFim, mesFim, kpiType]);

  return { kpiData, loading, error };
}

// Gera todos os meses entre dois pontos
function getMonthsBetween(anoInicio: number, mesInicio: number, anoFim: number, mesFim: number) {
  const months = [];
  let ano = anoInicio;
  let mes = mesInicio;
  while (ano < anoFim || (ano === anoFim && mes <= mesFim)) {
    months.push({ ano, mes });
    mes++;
    if (mes > 12) { mes = 1; ano++; }
  }
  return months;
}

// Garante mínimo de 12 meses recuando o início se necessário
function ensureMinMonths(anoInicio: number, mesInicio: number, anoFim: number, mesFim: number, min = 12) {
  const months = getMonthsBetween(anoInicio, mesInicio, anoFim, mesFim);
  if (months.length >= min) return { anoInicio, mesInicio };

  let ano = anoInicio;
  let mes = mesInicio;
  const diff = min - months.length;
  for (let i = 0; i < diff; i++) {
    mes--;
    if (mes <= 0) { mes = 12; ano--; }
  }
  return { anoInicio: ano, mesInicio: mes };
}

interface MonthlyKpiItem {
  ano: number;
  mes: number;
  label: string;
  receita_total: number;
  total_pedidos: number;
  ticket_medio: number;
}

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

export function useMonthlyKpi(anoInicio: number, mesInicio: number, anoFim: number, mesFim: number) {
  const [data, setData]     = useState<MonthlyKpiItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    // Garante mínimo de 12 meses
    const { anoInicio: anoIni, mesInicio: mesIni } = ensureMinMonths(anoInicio, mesInicio, anoFim, mesFim);
    const allMonths = getMonthsBetween(anoIni, mesIni, anoFim, mesFim);
    const totalMonths = allMonths.length;

    // Define agrupamento
    const groupBy: "month" | "quarter" | "year" =
      totalMonths <= 12 ? "month" :
      totalMonths <= 36 ? "quarter" : "year";

    setLoading(true);
    setError(null);

    const promises = allMonths.map(({ ano, mes }) =>
      api
        .get<KpiStatusItem[]>(`/kpi-status?page=1&limit=100&ano=${ano}&mes=${mes}`)
        .then((res) => ({
          ano, mes,
          receita_total: res.data.reduce((s, i) => s + i.receita_total, 0),
          total_pedidos: res.data.reduce((s, i) => s + i.total_pedidos, 0),
        }))
    );

    Promise.all(promises)
      .then((results) => {
        if (groupBy === "month") {
          setData(results.map((r) => ({
            ...r,
            ticket_medio: r.total_pedidos > 0 ? r.receita_total / r.total_pedidos : 0,
            label: `${MESES[r.mes - 1]}/${String(r.ano).slice(-2)}`,
          })));
          return;
        }

        if (groupBy === "quarter") {
          const quarters: Record<string, { receita: number; pedidos: number; label: string }> = {};
          results.forEach(({ ano, mes, receita_total, total_pedidos }) => {
            const q = Math.ceil(mes / 3);
            const key = `${ano}-Q${q}`;
            if (!quarters[key]) quarters[key] = { receita: 0, pedidos: 0, label: `Q${q}/${String(ano).slice(-2)}` };
            quarters[key].receita  += receita_total;
            quarters[key].pedidos  += total_pedidos;
          });
          setData(Object.entries(quarters).map(([key, v]) => {
            const [ano, qStr] = key.split("-");
            const q = parseInt(qStr.replace("Q", ""));
            return {
              ano: parseInt(ano),
              mes: q * 3,
              label: v.label,
              receita_total: v.receita,
              total_pedidos: v.pedidos,
              ticket_medio: v.pedidos > 0 ? v.receita / v.pedidos : 0,
            };
          }));
          return;
        }

        // year
        const years: Record<number, { receita: number; pedidos: number }> = {};
        results.forEach(({ ano, receita_total, total_pedidos }) => {
          if (!years[ano]) years[ano] = { receita: 0, pedidos: 0 };
          years[ano].receita  += receita_total;
          years[ano].pedidos  += total_pedidos;
        });
        setData(Object.entries(years).map(([ano, v]) => ({
          ano: parseInt(ano),
          mes: 1,
          label: String(ano),
          receita_total: v.receita,
          total_pedidos: v.pedidos,
          ticket_medio: v.pedidos > 0 ? v.receita / v.pedidos : 0,
        })));
      })
      .catch((err) => { setData([]); setError(err.message ?? String(err)); })
      .finally(() => setLoading(false));
  }, [anoInicio, mesInicio, anoFim, mesFim]);

  return { data, loading, error };
}

export function useMonthlyTickets(anoInicio: number, mesInicio: number, anoFim: number, mesFim: number) {
  const [data, setData]       = useState<MonthlyTicketsProcessed | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      ano_inicio: String(anoInicio),
      mes_inicio: String(mesInicio),
      ano_fim:    String(anoFim),
      mes_fim:    String(mesFim),
    });

    api
      .get<MonthlyTicketsProcessed>(`pedidos_cliente/total-com-tickets?${params.toString()}`)
      .then((res) => {
        setData({
          ano: res.data.ano,
          mes: res.data.mes,
          entrega_atrasada: res.data.entrega_atrasada,
          entrega_no_prazo: res.data.entrega_no_prazo,
        });
      })
      .catch((err) => { setData(null); setError(err.message ?? String(err)); })
      .finally(() => setLoading(false));
  }, [anoInicio, mesInicio, anoFim, mesFim]);

  return { data, loading, error };
}

export function useMonthlyReview(anoInicio: number, mesInicio: number, anoFim: number, mesFim: number) {
  const [data, setData]       = useState<MonthlyReviewProcessed | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      ano_inicio: String(anoInicio),
      mes_inicio: String(mesInicio),
      ano_fim:    String(anoFim),
      mes_fim:    String(mesFim),
    });

    api
      .get<MonthlyReviewProcessed>(`/avaliacoes?${params.toString()}`)
      .then((res) => {
        const item = res.data;
        const total = item.positiva + item.neutra + item.ruim;
        const toPercent = (val: number) => total > 0 ? Math.round((val / total) * 100) : 0;
        setData({
          ano: item.ano,
          mes: item.mes,
          ruim:     toPercent(item.ruim),
          neutra:   toPercent(item.neutra),
          positiva: toPercent(item.positiva),
        });
      })
      .catch((err) => { setData(null); setError(err.message ?? String(err)); })
      .finally(() => setLoading(false));
  }, [anoInicio, mesInicio, anoFim, mesFim]);

  return { data, loading, error };
}

export function useKpiCategoria(anoInicio: number, mesInicio: number, anoFim: number, mesFim: number) {
  const [data, setData]       = useState<KpiCategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page: "1", limit: "500",
      ano_inicio: String(anoInicio), mes_inicio: String(mesInicio),
      ano_fim:    String(anoFim),    mes_fim:    String(mesFim),
    });

    api
      .get(`/kpi-category?${params.toString()}`)
      .then((res) => setData(res.data))
      .catch((err) => { setData([]); setError(err.message ?? String(err)); })
      .finally(() => setLoading(false));
  }, [anoInicio, mesInicio, anoFim, mesFim]);

  return { data, loading, error };
}

export function useKpiEstado(anoInicio: number, mesInicio: number, anoFim: number, mesFim: number) {
  const [data, setData]       = useState<KpiStateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page: "1", limit: "500",
      ano_inicio: String(anoInicio), mes_inicio: String(mesInicio),
      ano_fim:    String(anoFim),    mes_fim:    String(mesFim),
    });

    api
      .get(`/kpi-state?${params.toString()}`)
      .then((res) => setData(res.data))
      .catch((err) => { setData([]); setError(err.message ?? String(err)); })
      .finally(() => setLoading(false));
  }, [anoInicio, mesInicio, anoFim, mesFim]);

  return { data, loading, error };
}