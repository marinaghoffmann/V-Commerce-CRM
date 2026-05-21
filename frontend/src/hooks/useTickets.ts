import { useCallback, useEffect, useState } from "react";
import type { Ticket } from "../components/types/ticket.types";
import api from "../services/api";

interface UseTicketsArgs {
  page?: number;
  limit?: number;
  status?: string | null;   
  search?: string | null;
  categoria?: string | null; 
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

  function buildParams(args: UseTicketsArgs & { page: number; limit: number }): URLSearchParams {
    const params = new URLSearchParams();
    params.append("page", String(args.page));
    params.append("limit", String(args.limit));

    if (args.status) {
      args.status.split(",").map((s) => s.trim()).filter(Boolean).forEach((s) => {
        params.append("status[]", s);
      });
    }

    if (args.search?.trim()) {
      params.append("search", args.search.trim());
    }

    if (args.categoria) {
      args.categoria.split(",").map((c) => c.trim()).filter(Boolean).forEach((c) => {
        params.append("categoria[]", c);
      });
    }

    return params;
  }

  const fetchTickets = useCallback(
    async (args?: UseTicketsArgs) => {
      setLoading(true);
      setError(null);
      try {
        const merged: UseTicketsArgs & { page: number; limit: number } = {
          page: args?.page ?? page,
          limit,
          status: args?.status ?? initArgs.status ?? null,
          search: args?.search ?? initArgs.search ?? null,
          categoria: args?.categoria ?? initArgs.categoria ?? null,
        };

        const params = buildParams(merged);

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
    [page, limit] 
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