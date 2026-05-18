import api from "../services/api";
import { useEffect, useState } from "react";
import type { KpiStatusItem, MonthlyReviewProcessed, MonthlyTicketsProcessed } from "../components/types/dashboard.types";

interface UseKpiStatusArgs {
  page: number;
  limit: number;
  ano?: number;
  mes?: number;
}

export function useKpiStatus({
  page,
  limit,
  ano,
  mes,
}: UseKpiStatusArgs) {
  const [kpiStatus, setKpiStatus] = useState<KpiStatusItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();

    params.append("page", String(page));
    params.append("limit", String(limit));

    if (ano !== undefined) {
      params.append("ano", String(ano));
    }

    if (mes !== undefined) {
      params.append("mes", String(mes));
    }

    api
      .get(`/kpi-status?${params.toString()}`)
      .then((response) => {
        setKpiStatus(response.data);
      })
      .catch((err) => {
        setKpiStatus([]);
        setError(err.message ?? String(err));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page, limit, ano, mes]);

  return {
    kpiStatus,
    loading,
    error,
  };
}

function getLast12Months(currentYear: number, currentMonth: number) {
  const months = [];
  for (let i = 11; i >= 0; i--) {
    let year = currentYear;
    let month = currentMonth - i;
    if (month <= 0) {
      month += 12;
      year -= 1;
    }
    months.push({ ano: year, mes: month });
  }
  return months;
}

interface MonthlyKpiItem {
  ano: number;
  mes: number;
  receita_total: number;
  total_pedidos: number;
  ticket_medio: number;
}

export function useMonthlyKpi(ano: number, mes: number) {
  const [data, setData] = useState<MonthlyKpiItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const months = getLast12Months(ano, mes);
    setLoading(true);
    setError(null);

    const promises = months.map(({ ano: y, mes: m }) =>
      api
        .get<KpiStatusItem[]>(`/kpi-status?page=1&limit=100&ano=${y}&mes=${m}`)
        .then((res) => ({
          ano: y,
          mes: m,
          items: res.data,
        }))
    );

    Promise.all(promises)
      .then((results) => {
        const processed = results.map(({ ano, mes, items }) => {
          const totalReceita = items.reduce((sum, item) => sum + item.receita_total, 0);
          const totalPedidos = items.reduce((sum, item) => sum + item.total_pedidos, 0);
          const ticketMedio = totalPedidos > 0 ? totalReceita / totalPedidos : 0;

          return {
            ano,
            mes,
            receita_total: totalReceita,
            total_pedidos: totalPedidos,
            ticket_medio: ticketMedio,
          };
        });
        setData(processed);
      })
      .catch((err) => {
        setData([]);
        setError(err.message ?? String(err));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [ano, mes]);

  return { data, loading, error };
}

export function useMonthlyTickets(ano: number, mes: number) {
  const [data, setData] = useState<MonthlyTicketsProcessed | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    api
      .get<MonthlyTicketsProcessed>(`pedidos_cliente/total-com-tickets?ano=${ano}&mes=${mes}`)
      .then((res) => {
        const item = res.data;
        const total = item.entrega_atrasada + item.entrega_no_prazo;
        const toPercent = (val: number) => total > 0 ? Math.round((val / total) * 100) : 0;

        setData({
          ano: item.ano,
          mes: item.mes,
          entrega_atrasada: item.entrega_atrasada,
          entrega_no_prazo: item.entrega_no_prazo,
        });
      })
      .catch((err) => {
        setData(null);
        setError(err.message ?? String(err));
      })
      .finally(() => setLoading(false));
  }, [ano, mes]);

  return { data, loading, error };
}

export function useMonthlyReview(ano: number, mes: number) {
  const [data, setData] = useState<MonthlyReviewProcessed | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    api
      .get<MonthlyReviewProcessed>(`/avaliacoes?ano=${ano}&mes=${mes}`)
      .then((res) => {
        const item = res.data;
        const total = item.positiva + item.neutra + item.ruim;
        const toPercent = (val: number) => total > 0 ? Math.round((val / total) * 100) : 0;

        setData({
          ano: item.ano,
          mes: item.mes,
          ruim: toPercent(item.ruim),
          neutra: toPercent(item.neutra),
          positiva: toPercent(item.positiva),
        });
      })
      .catch((err) => {
        setData(null);
        setError(err.message ?? String(err));
      })
      .finally(() => setLoading(false));
  }, [ano, mes]);

  return { data, loading, error };
}

interface KpiCategoriaItem {
  categoria: string;
  total_pedidos: number;
  receita_total: number;
}

interface KpiEstadoItem {
  estado: string;
  total_pedidos: number;
  receita_total: number;
}

export function useKpiCategoria(ano: number, mes: number) {
  const [data, setData] = useState<KpiCategoriaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    api
      .get(`/kpi-category?page=1&limit=100&ano=${ano}&mes=${mes}`)
      .then((res) => setData(res.data))
      .catch((err) => { setData([]); setError(err.message ?? String(err)); })
      .finally(() => setLoading(false));
  }, [ano, mes]);

  return { data, loading, error };
}

export function useKpiEstado(ano: number, mes: number) {
  const [data, setData] = useState<KpiEstadoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    api
      .get(`/kpi-state?page=1&limit=100&ano=${ano}&mes=${mes}`)
      .then((res) => setData(res.data))
      .catch((err) => { setData([]); setError(err.message ?? String(err)); })
      .finally(() => setLoading(false));
  }, [ano, mes]);

  return { data, loading, error };
}