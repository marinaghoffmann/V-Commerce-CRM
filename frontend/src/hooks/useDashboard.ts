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
  anoFim:    number;
  mesFim:    number;
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
      page:       "1",
      limit:      "500",
      ano_inicio: String(anoInicio),
      mes_inicio: String(mesInicio),
      ano_fim:    String(anoFim),
      mes_fim:    String(mesFim),
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
function getMonthsBetween(
  anoInicio: number, mesInicio: number,
  anoFim: number,   mesFim: number
) {
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

export function useMonthlyKpi(
  anoInicio: number, mesInicio: number,
  anoFim: number,   mesFim: number
) {
  const [data, setData]       = useState<MonthlyKpiItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    const { anoInicio: anoIni, mesInicio: mesIni } =
      ensureMinMonths(anoInicio, mesInicio, anoFim, mesFim);
    const allMonths   = getMonthsBetween(anoIni, mesIni, anoFim, mesFim);
    const totalMonths = allMonths.length;

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
          const quarters: Record<string, { receita: number; pedidos: number; label: string; ano: number; mes: number }> = {};
          results.forEach(({ ano, mes, receita_total, total_pedidos }) => {
            const q   = Math.ceil(mes / 3);
            const key = `${ano}-Q${q}`;
            if (!quarters[key]) quarters[key] = {
              receita: 0, pedidos: 0,
              label: (() => {
                const mesInicio = (q - 1) * 3 + 1;
                const mesFim    = q * 3;
                return `${MESES[mesInicio - 1]}-${MESES[mesFim - 1]}/${String(ano).slice(-2)}`;
              })(),
              ano, mes: q * 3,
            };
            quarters[key].receita += receita_total;
            quarters[key].pedidos += total_pedidos;
          });
          setData(Object.values(quarters).map((v) => ({
            ano:           v.ano,
            mes:           v.mes,
            label:         v.label,
            receita_total: v.receita,
            total_pedidos: v.pedidos,
            ticket_medio:  v.pedidos > 0 ? v.receita / v.pedidos : 0,
          })));
          return;
        }

        // year
        const years: Record<number, { receita: number; pedidos: number }> = {};
        results.forEach(({ ano, receita_total, total_pedidos }) => {
          if (!years[ano]) years[ano] = { receita: 0, pedidos: 0 };
          years[ano].receita += receita_total;
          years[ano].pedidos += total_pedidos;
        });
        setData(Object.entries(years).map(([ano, v]) => ({
          ano:           parseInt(ano),
          mes:           1,
          label:         String(ano),
          receita_total: v.receita,
          total_pedidos: v.pedidos,
          ticket_medio:  v.pedidos > 0 ? v.receita / v.pedidos : 0,
        })));
      })
      .catch((err) => { setData([]); setError(err.message ?? String(err)); })
      .finally(() => setLoading(false));
  }, [anoInicio, mesInicio, anoFim, mesFim]);

  return { data, loading, error };
}

// Hook exclusivo para os cards — busca EXATAMENTE o período selecionado sem mínimo
export function useMonthlyKpiForCards(
  anoInicio: number, mesInicio: number,
  anoFim: number,   mesFim: number
) {
  const [data, setData]       = useState<{ receita_total: number; total_pedidos: number; ticket_medio: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    const months = getMonthsBetween(anoInicio, mesInicio, anoFim, mesFim);
    setLoading(true);
    setError(null);

    const promises = months.map(({ ano, mes }) =>
      api
        .get<KpiStatusItem[]>(`/kpi-status?page=1&limit=100&ano=${ano}&mes=${mes}`)
        .then((res) => ({
          receita_total: res.data.reduce((s, i) => s + i.receita_total, 0),
          total_pedidos: res.data.reduce((s, i) => s + i.total_pedidos, 0),
          ticket_medio:  res.data.length > 0
            ? res.data.reduce((s, i) => s + i.ticket_medio, 0) / res.data.length
            : 0,
        }))
    );

    Promise.all(promises)
      .then(setData)
      .catch((err) => { setData([]); setError(err.message ?? String(err)); })
      .finally(() => setLoading(false));
  }, [anoInicio, mesInicio, anoFim, mesFim]);

  return { data, loading, error };
}

export function useMonthlyTickets(
  anoInicio: number, mesInicio: number,
  anoFim: number,   mesFim: number
) {
  const [data, setData]       = useState<MonthlyTicketsProcessed | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      ano_inicio: String(anoInicio), mes_inicio: String(mesInicio),
      ano_fim:    String(anoFim),    mes_fim:    String(mesFim),
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

export function useMonthlyReview(
  anoInicio: number, mesInicio: number,
  anoFim: number,   mesFim: number
) {
  const [data, setData]       = useState<MonthlyReviewProcessed | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      ano_inicio: String(anoInicio), mes_inicio: String(mesInicio),
      ano_fim:    String(anoFim),    mes_fim:    String(mesFim),
    });

    api
      .get<MonthlyReviewProcessed>(`/avaliacoes?${params.toString()}`)
      .then((res) => {
        const item  = res.data;
        const total = item.positiva + item.neutra + item.ruim;
        const toPercent = (val: number) =>
          total > 0 ? Number(((val / total) * 100).toFixed(2)) : 0;
        setData({
          ano:      item.ano,
          mes:      item.mes,
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

export function useKpiCategoria(
  anoInicio: number, mesInicio: number,
  anoFim: number,   mesFim: number
) {
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
      .then((res) => {
        const items = res.data as KpiCategoryItem[];
        const map   = new Map<string, { receita_total: number; total_pedidos: number; total_clientes_unicos: number }>();
        items.forEach((it) => {
          const key   = it.categoria ?? "";
          const entry = map.get(key) ?? { receita_total: 0, total_pedidos: 0, total_clientes_unicos: 0 };
          entry.receita_total        += it.receita_total        ?? 0;
          entry.total_pedidos        += it.total_pedidos        ?? 0;
          entry.total_clientes_unicos += it.total_clientes_unicos ?? 0;
          map.set(key, entry);
        });
        const aggregated: KpiCategoryItem[] = Array.from(map.entries()).map(([categoria, v]) => ({
          id: categoria, ano_venda: anoFim, mes_venda: mesFim, categoria,
          receita_total:          v.receita_total,
          total_pedidos:          v.total_pedidos,
          total_clientes_unicos:  v.total_clientes_unicos,
          ticket_medio: v.total_pedidos > 0 ? v.receita_total / v.total_pedidos : 0,
        }));
        setData(aggregated.sort((a, b) => b.receita_total - a.receita_total));
      })
      .catch((err) => { setData([]); setError(err.message ?? String(err)); })
      .finally(() => setLoading(false));
  }, [anoInicio, mesInicio, anoFim, mesFim]);

  return { data, loading, error };
}

export function useKpiEstado(
  anoInicio: number, mesInicio: number,
  anoFim: number,   mesFim: number
) {
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
      .then((res) => {
        const items = res.data as KpiStateItem[];
        const map   = new Map<string, { receita_total: number; total_pedidos: number; total_clientes_unicos: number }>();
        items.forEach((it) => {
          const key   = it.estado ?? "";
          const entry = map.get(key) ?? { receita_total: 0, total_pedidos: 0, total_clientes_unicos: 0 };
          entry.receita_total        += it.receita_total        ?? 0;
          entry.total_pedidos        += it.total_pedidos        ?? 0;
          entry.total_clientes_unicos += it.total_clientes_unicos ?? 0;
          map.set(key, entry);
        });
        const aggregated: KpiStateItem[] = Array.from(map.entries()).map(([estado, v]) => ({
          id: estado, ano_venda: anoFim, mes_venda: mesFim, estado,
          receita_total:         v.receita_total,
          total_pedidos:         v.total_pedidos,
          total_clientes_unicos: v.total_clientes_unicos,
          ticket_medio: v.total_pedidos > 0 ? v.receita_total / v.total_pedidos : 0,
        }));
        setData(aggregated.sort((a, b) => b.receita_total - a.receita_total));
      })
      .catch((err) => { setData([]); setError(err.message ?? String(err)); })
      .finally(() => setLoading(false));
  }, [anoInicio, mesInicio, anoFim, mesFim]);

  return { data, loading, error };
}

// Calcula o período anterior equivalente (mesmo intervalo, 1 ano antes)
function getPreviousPeriod(
  anoInicio: number, mesInicio: number,
  anoFim: number,   mesFim: number
) {
  return {
    anoInicio: anoInicio - 1,
    mesInicio,
    anoFim:    anoFim - 1,
    mesFim,
  };
}

export function useMonthlyKpiForPreviousPeriod(
  anoInicio: number, mesInicio: number,
  anoFim: number,   mesFim: number,
  minYear = 2023
) {
  const [data, setData]         = useState<{ receita_total: number; total_pedidos: number; ticket_medio: number }[]>([]);
  const [available, setAvailable] = useState(false);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    const prev = getPreviousPeriod(anoInicio, mesInicio, anoFim, mesFim);

    // Só busca se o período anterior tiver dados no banco
    if (prev.anoInicio < minYear) {
      setAvailable(false);
      setData([]);
      return;
    }

    setLoading(true);
    const months = getMonthsBetween(prev.anoInicio, prev.mesInicio, prev.anoFim, prev.mesFim);

    const promises = months.map(({ ano, mes }) =>
      api
        .get<KpiStatusItem[]>(`/kpi-status?page=1&limit=100&ano=${ano}&mes=${mes}`)
        .then((res) => ({
          receita_total: res.data.reduce((s, i) => s + i.receita_total, 0),
          total_pedidos: res.data.reduce((s, i) => s + i.total_pedidos, 0),
          ticket_medio:  res.data.length > 0
            ? res.data.reduce((s, i) => s + i.ticket_medio, 0) / res.data.length
            : 0,
        }))
    );

    Promise.all(promises)
      .then((results) => {
        const hasData = results.some((r) => r.receita_total > 0 || r.total_pedidos > 0);
        setAvailable(hasData);
        setData(results);
      })
      .catch(() => { setAvailable(false); setData([]); })
      .finally(() => setLoading(false));
  }, [anoInicio, mesInicio, anoFim, mesFim]);

  return { data, available, loading };
}