import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "../components/types/product.types";
import api from "../services/api";

interface UseProductsArgs {
  page?: number;
  limit?: number;
  nome_produto?: string | null;
  categorias?: string[];
  ordem?: string | null;
}

export function useProducts(initArgs: UseProductsArgs = {}) {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(initArgs.page ?? 1);
  const [limit, setLimit] = useState<number>(initArgs.limit ?? 12);
  const categoriasRef = useRef<string[]>(initArgs.categorias ?? []);
  const nomeProdutoRef = useRef<string | null | undefined>(initArgs.nome_produto);
  const ordemRef = useRef<string | null | undefined>(initArgs.ordem);

  categoriasRef.current = initArgs.categorias ?? [];
  nomeProdutoRef.current = initArgs.nome_produto;
  ordemRef.current = initArgs.ordem;

  const fetchProducts = useCallback(async (args?: UseProductsArgs) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append("page", String(args?.page ?? page));
      params.append("limit", String(args?.limit ?? limit));
      if (args?.nome_produto) params.append("nome_produto", args.nome_produto);
      if (args?.ordem) params.append("ordem", args.ordem);
      (args?.categorias ?? []).forEach((c) => params.append("categoria", c));

      const res = await api.get(`/produto?${params.toString()}`);
      const json = res.data;
      const items: Product[] = Array.isArray(json) ? json : json.items ?? json.data ?? [];
      setData(items);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchProducts({
      page,
      limit,
      categorias: categoriasRef.current,
      nome_produto: nomeProdutoRef.current,
      ordem: ordemRef.current,
    });
  }, [fetchProducts, page, limit, initArgs.categorias?.join(","), initArgs.nome_produto, initArgs.ordem]);

  const refetch = useCallback(
    () => fetchProducts({ page, limit, categorias: categoriasRef.current, nome_produto: nomeProdutoRef.current, ordem: ordemRef.current }),
    [fetchProducts, page, limit]
  );

  const addProduct = useCallback(async (productBody: Omit<Product, "id_produto">) => {
    const res = await api.post("/produto/", productBody);
    return res.data;
  }, []);

  const editProduct = useCallback(async (id_produto: string, productBody: Partial<Product>) => {
    const res = await api.patch(`/produto/${id_produto}`, productBody);
    return res.data;
  }, []);

  const deleteProduct = useCallback(async (id_produto: string) => {
    await api.delete(`/produto/${id_produto}`);
  }, []);

  return { data, loading, error, page, setPage, limit, setLimit, refetch, addProduct, editProduct, deleteProduct };
}