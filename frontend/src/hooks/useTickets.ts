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

  const [filters, setFilters] = useState<{
    status: string | null;
    search: string | null;
    categoria: string | null;
  }>({
    status: initArgs.status ?? null,
    search: initArgs.search ?? null,
    categoria: initArgs.categoria ?? null,
  });

  const fetchKpis = useCallback(async () => {
    try {
      const res = await api.get(`/ticket/kpis/resumo`);
      setKpis(res.data);
    } catch (err) {
      console.error("Erro ao buscar KPIs", err);
    }
  }, []);

  function buildParams(
    currentPage: number,
    currentLimit: number,
    currentFilters: typeof filters
  ): URLSearchParams {
    const params = new URLSearchParams();
    params.append("page", String(currentPage));
    params.append("limit", String(currentLimit));

    if (currentFilters.status) {
      currentFilters.status
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((s) => params.append("status[]", s));
    }

    if (currentFilters.search?.trim()) {
      params.append("search", currentFilters.search.trim());
    }

    if (currentFilters.categoria) {
      currentFilters.categoria
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
        .forEach((c) => params.append("categoria[]", c));
    }

    return params;
  }

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = buildParams(page, limit, filters);

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
  }, [page, limit, filters]); 

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    fetchKpis();
  }, [fetchKpis]);

  const refetch = useCallback(
    (args?: UseTicketsArgs) => {
      if (args) {
        if (args.page !== undefined) setPage(args.page);
        setFilters({
          status: args.status !== undefined ? args.status ?? null : filters.status,
          search: args.search !== undefined ? args.search ?? null : filters.search,
          categoria: args.categoria !== undefined ? args.categoria ?? null : filters.categoria,
        });
      } else {
        fetchTickets();
      }
    },
    [filters, fetchTickets]
  );

  return { data, total, loading, error, page, setPage, limit, refetch, kpis, fetchKpis };
}