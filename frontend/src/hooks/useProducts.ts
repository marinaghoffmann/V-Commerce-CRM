import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "../components/types/product.types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

interface UseProductsArgs {
  page?: number;
  limit?: number;
  nome_produto?: string | null;
  categorias?: string[];
}

export function useProducts(initArgs: UseProductsArgs = {}) {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(initArgs.page ?? 1);
  const [limit, setLimit] = useState<number>(initArgs.limit ?? 12);
  const categoriasRef = useRef<string[]>(initArgs.categorias ?? []);

  categoriasRef.current = initArgs.categorias ?? [];

  const fetchProducts = useCallback(async (args?: UseProductsArgs) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append("page", String(args?.page ?? page));
      params.append("limit", String(args?.limit ?? limit));
      if (args?.nome_produto) params.append("nome_produto", args.nome_produto);
      (args?.categorias ?? []).forEach((c) => params.append("categoria", c));

      const res = await fetch(`${BASE_URL}/produto?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const items: Product[] = Array.isArray(json) ? json : json.items ?? json.data ?? [];
      setData(items);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchProducts({ page, limit, categorias: categoriasRef.current });
  }, [fetchProducts, page, limit, initArgs.categorias?.join(",")]);

  const refetch = useCallback(
    () => fetchProducts({ page, limit, categorias: categoriasRef.current }),
    [fetchProducts, page, limit]
  );

  return { data, loading, error, page, setPage, limit, setLimit, refetch };
}