import { useState, useEffect } from "react";
import type { Pedido } from "../components/types/pedido.types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

interface UseOrdersArgs {
  page: number;
  pageSize: number;
  search: string;
  searchField: string;
  activeFilter: string;
}

export function useOrders({ page, pageSize, search, searchField, activeFilter }: UseOrdersArgs) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchPedidos = async () => {
      setIsFetching(true);
      try {
        const offset = (page - 1) * pageSize;
        const params = new URLSearchParams({
          limit: String(pageSize),
          offset: String(offset),
        });

        if (search) params.append(searchField, search);
        if (activeFilter !== "Todos") params.append("status", activeFilter);

        const res = await fetch(`${BASE_URL}/pedidos_cliente?${params.toString()}`);
        const data = await res.json();
        const items = Array.isArray(data) ? data : data.items ?? data.data ?? [];
        
        setPedidos(items);
        if (data.total) setTotal(data.total);
      } catch (err) {
        console.error("Erro ao buscar pedidos:", err);
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchPedidos();
  }, [page, pageSize, search, searchField, activeFilter]);

  return { pedidos, isFetching, total };
}
