import { useCallback, useEffect, useState } from "react";
import type { Ticket } from "../components/types/ticket.types";
import api from "../services/api";

interface UseTicketsArgs {
  page?: number;
  limit?: number;
  status?: string | null;
  search?: string | null;
}

export function useTickets(initArgs: UseTicketsArgs = {}) {
  const [data, setData] = useState<Ticket[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(initArgs.page ?? 1);
  const [limit] = useState<number>(initArgs.limit ?? 7);
  const [kpis, setKpis] = useState<Record<string, number | string>>({});

  const fetchKpis = useCallback(async () => {
    try {
      const res = await api.get(`/ticket/kpis/resumo`);
      setKpis(res.data);
    } catch (err) {
      console.error("Erro ao buscar KPIs", err);
    }
  }, []);

  const fetchTickets = useCallback(
    async (args?: UseTicketsArgs) => {
      setLoading(true);
      setError(null);
      try {
        const currentPage = args?.page ?? page;
        const st = args?.status ?? initArgs.status;
        const q = args?.search ?? initArgs.search;

        const params = new URLSearchParams();
        params.append("page", String(currentPage));
        params.append("limit", String(limit));
        if (st && st !== "Todos") params.append("status", st);
        if (q) params.append("search", q);

        // busca tickets e total em paralelo
        const [resTickets, resCount] = await Promise.all([
          api.get(`/ticket?${params.toString()}`),
          api.get(`/ticket/count?${params.toString()}`),
        ]);

        const json = resTickets.data;
        const countJson = resCount.data;

        setData(Array.isArray(json) ? json : json.items ?? json.data ?? []);
        setTotal(countJson.total ?? 0);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    },
    [page, limit] // eslint-disable-line
  );

  useEffect(() => {
    fetchTickets({ page, limit });
  }, [fetchTickets, page, limit]);

  useEffect(() => {
    fetchKpis();
  }, [fetchKpis]);

  const refetch = useCallback(
    (args?: UseTicketsArgs) => fetchTickets({ page, limit, ...args }),
    [fetchTickets, page, limit]
  );

  return { data, total, loading, error, page, setPage, limit, refetch, kpis, fetchKpis };
}