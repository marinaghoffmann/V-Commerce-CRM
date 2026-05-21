import api from "../services/api";
import { useEffect, useState } from "react";
import type {
  KpiStatusItem,
  KpiStateItem,
  KpiCategoryItem,
  MonthlyReviewProcessed,
  MonthlyTicketsProcessed,
  MonthlyKpiItem
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

export interface CompPeriod {
  anoInicio: number;
  mesInicio: number;
  anoFim: number;
  mesFim: number;
}

function getMonthsBetween(
  anoInicio: number,
  mesInicio: number,
  anoFim: number,
  mesFim: number
) {
  const months: { ano: number; mes: number }[] = [];

  const inicio = new Date(anoInicio, mesInicio - 1);
  const fim    = new Date(anoFim, mesFim - 1);

  const atual = new Date(inicio);

  while (atual <= fim) {
    months.push({
      ano: atual.getFullYear(),
      mes: atual.getMonth() + 1,
    });

    atual.setMonth(atual.getMonth() + 1);
  }

  return months;
}

function ensureMinMonths(anoInicio: number, mesInicio: number, anoFim: number, mesFim: number, min = 12) {
  const months = getMonthsBetween(anoInicio, mesInicio, anoFim, mesFim);
  if (months.length >= min) return { anoInicio, mesInicio };

  if(months.length === 1){
    return { anoInicio: anoInicio, mesInicio: mesInicio-1}
  }

  return { anoInicio: anoInicio, mesInicio: mesInicio };
}

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

export function useMonthlyKpi(
  anoInicio: number, mesInicio: number,
  anoFim: number, mesFim: number,
  comp?: CompPeriod
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
 
    const compMonths = comp
      ? (() => {
          const { anoInicio: cAnoIni, mesInicio: cMesIni } =
            ensureMinMonths(comp.anoInicio, comp.mesInicio, comp.anoFim, comp.mesFim);
          return getMonthsBetween(cAnoIni, cMesIni, comp.anoFim, comp.mesFim);
        })()
      : [];
 
    setLoading(true);
    setError(null);
 
    const fetchMonth = ({ ano, mes }: { ano: number; mes: number }) =>
      api
        .get<KpiStatusItem[]>(`/kpi-status?page=1&limit=100&ano=${ano}&mes=${mes}`)
        .then((res) => {
          const receita_total = res.data.reduce((s, i) => s + i.receita_total, 0);
          const total_pedidos = res.data.reduce((s, i) => s + i.total_pedidos, 0);
          return {
            ano, mes,
            receita_total,
            total_pedidos,
            label: `${MESES[mes - 1]}/${String(ano).slice(-2)}`,
          };
        });
 
    Promise.all([
      Promise.all(allMonths.map(fetchMonth)),
      compMonths.length > 0
        ? Promise.all(compMonths.map(fetchMonth))
        : Promise.resolve([] as Awaited<ReturnType<typeof fetchMonth>>[]),
    ])
      .then(([results, compResults]) => {
 
        if (groupBy === "month") {
          setData(
            results.map((r, i) => {
              const p = compResults[i];
              return {
                ano:               r.ano,
                mes:               r.mes,
                label:             r.label,
                receita_total:     r.receita_total,
                total_pedidos:     r.total_pedidos,
                ticket_medio:      r.total_pedidos > 0 ? r.receita_total / r.total_pedidos : 0,
                prev_receita:      p?.receita_total      ?? 0,
                prev_pedidos:      p?.total_pedidos      ?? 0,
                prev_ticket_medio: p && p.total_pedidos > 0 ? p.receita_total / p.total_pedidos : 0,
                prev_label:        p?.label ?? "",
              };
            })
          );
          return;
        }
 
        if (groupBy === "quarter") {
          type QuarterEntry = {
            receita: number; pedidos: number;
            prev_receita: number; prev_pedidos: number;
            label: string; prev_label: string;
            ano: number; mes: number;
          };
 
          const quarters: Record<string, QuarterEntry> = {};
          const compQuarters: Record<string, { receita: number; pedidos: number; label: string }> = {};
 
          results.forEach(({ ano, mes, receita_total, total_pedidos }) => {
            const q   = Math.ceil(mes / 3);
            const key = `${ano}-Q${q}`;
            if (!quarters[key]) {
              const mIni = (q - 1) * 3 + 1;
              const mFim = q * 3;
              quarters[key] = {
                receita: 0, pedidos: 0,
                prev_receita: 0, prev_pedidos: 0,
                label: `${MESES[mIni - 1]}-${MESES[mFim - 1]}/${String(ano).slice(-2)}`,
                prev_label: "",
                ano, mes: q * 3,
              };
            }
            quarters[key].receita += receita_total;
            quarters[key].pedidos += total_pedidos;
          });
 
          compResults.forEach(({ ano, mes, receita_total, total_pedidos }) => {
            const q   = Math.ceil(mes / 3);
            const key = `${ano}-Q${q}`;
            if (!compQuarters[key]) {
              const mIni = (q - 1) * 3 + 1;
              const mFim = q * 3;
              compQuarters[key] = {
                receita: 0, pedidos: 0,
                label: `${MESES[mIni - 1]}-${MESES[mFim - 1]}/${String(ano).slice(-2)}`,
              };
            }
            compQuarters[key].receita += receita_total;
            compQuarters[key].pedidos += total_pedidos;
          });
 
          const mainKeys = Object.keys(quarters);
          const compKeys = Object.keys(compQuarters);
          compKeys.forEach((ck, i) => {
            const mk = mainKeys[i];
            if (mk && quarters[mk]) {
              quarters[mk].prev_receita = compQuarters[ck].receita;
              quarters[mk].prev_pedidos = compQuarters[ck].pedidos;
              quarters[mk].prev_label   = compQuarters[ck].label;
            }
          });
 
          setData(
            Object.values(quarters).map((v) => ({
              ano:               v.ano,
              mes:               v.mes,
              label:             v.label,
              receita_total:     v.receita,
              total_pedidos:     v.pedidos,
              ticket_medio:      v.pedidos > 0 ? v.receita / v.pedidos : 0,
              prev_receita:      v.prev_receita,
              prev_pedidos:      v.prev_pedidos,
              prev_ticket_medio: v.prev_pedidos > 0 ? v.prev_receita / v.prev_pedidos : 0,
              prev_label:        v.prev_label,
            }))
          );
          return;
        }
 
        type YearEntry = {
          receita: number; pedidos: number;
          prev_receita: number; prev_pedidos: number;
          prev_label: string;
        };
 
        const years:     Record<number, YearEntry> = {};
        const compYears: Record<number, { receita: number; pedidos: number }> = {};
 
        results.forEach(({ ano, receita_total, total_pedidos }) => {
          if (!years[ano]) years[ano] = { receita: 0, pedidos: 0, prev_receita: 0, prev_pedidos: 0, prev_label: "" };
          years[ano].receita += receita_total;
          years[ano].pedidos += total_pedidos;
        });
 
        compResults.forEach(({ ano, receita_total, total_pedidos }) => {
          if (!compYears[ano]) compYears[ano] = { receita: 0, pedidos: 0 };
          compYears[ano].receita += receita_total;
          compYears[ano].pedidos += total_pedidos;
        });
 
        const mainYearKeys = Object.keys(years).map(Number);
        const compYearKeys = Object.keys(compYears).map(Number);
        compYearKeys.forEach((cy, i) => {
          const my = mainYearKeys[i];
          if (my && years[my]) {
            years[my].prev_receita = compYears[cy].receita;
            years[my].prev_pedidos = compYears[cy].pedidos;
            years[my].prev_label   = String(cy);
          }
        });
 
        setData(
          Object.entries(years).map(([ano, v]) => ({
            ano:               parseInt(ano),
            mes:               1,
            label:             String(ano),
            receita_total:     v.receita,
            total_pedidos:     v.pedidos,
            ticket_medio:      v.pedidos > 0 ? v.receita / v.pedidos : 0,
            prev_receita:      v.prev_receita,
            prev_pedidos:      v.prev_pedidos,
            prev_ticket_medio: v.prev_pedidos > 0 ? v.prev_receita / v.prev_pedidos : 0,
            prev_label:        v.prev_label,
          }))
        );
      })
      .catch((err) => { setData([]); setError(err.message ?? String(err)); })
      .finally(() => setLoading(false));
 
  }, [
    anoInicio, mesInicio, anoFim, mesFim,
    comp?.anoInicio, comp?.mesInicio, comp?.anoFim, comp?.mesFim,
  ]);
 
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
    anoInicio: anoInicio,
    mesInicio,
    anoFim:    anoFim,
    mesFim,
  };
}

export function useMonthlyKpiForCompPeriod(
  anoInicio: number, mesInicio: number,
  anoFim: number,   mesFim: number,
  minYear = 2023
) {
  const [data, setData]         = useState<{ receita_total: number; total_pedidos: number; ticket_medio: number, label: string}[]>([]);
  const [available, setAvailable] = useState(false);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    const prev = getPreviousPeriod(anoInicio, mesInicio, anoFim, mesFim);

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
        label: `${MESES[mes - 1]}/${String(ano).slice(-2)}`,
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