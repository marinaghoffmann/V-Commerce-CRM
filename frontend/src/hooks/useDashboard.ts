import api from "../services/api";
import { useEffect, useState } from "react";
import type { KpiStatusItem } from "../components/types/dashboard.types";

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