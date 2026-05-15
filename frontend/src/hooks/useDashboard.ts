import api from "../services/api";
import { useEffect, useState } from "react";
import type { KpiStatusItem, MonthlyKpiItem } from "../components/types/dashboard.types";

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

export function useMonthlyKpi(ano: number, mes: number) {
  const [data, setData] = useState<MonthlyKpiItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const months = getLast12Months(ano, mes);
    setLoading(true);
    setError(null);

    const promises = months.map(({ ano: y, mes: m }) =>
        api.get<KpiStatusItem[]>(`/kpi-status?page=1&limit=100&ano=${y}&mes=${m}`)
        .then((res) => ({
        ano: y,
        mes: m,
        items: res.data,
        }))
    );

    Promise.all(promises)
      .then((results) => {
        const processed = results.map(({ ano, mes, items }) => {
          const totalReceita = items.reduce(
            (sum, item) => sum + item.receita_total,
            0
          );
          const totalPedidos = items.reduce(
            (sum, item) => sum + item.total_pedidos,
            0
          );
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

  return {
    data,
    loading,
    error,
  };
}