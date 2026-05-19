import { useState, useEffect, useMemo } from "react";
import type { Pedido } from "../components/types/pedido.types";
import type { DateRange } from "../components/atoms/DateRangeFilter";
import api from "../services/api";

interface UseOrdersArgs {
  page: number;
  pageSize: number;
  search: string;
  selectedCategoria: string[];
  selectedStatus: string[];
  dateRange: DateRange;
}

export function useOrders({
  page,
  pageSize,
  search,
  selectedCategoria,
  selectedStatus,
  dateRange,
}: UseOrdersArgs) {
  const [allPedidos, setAllPedidos] = useState<Pedido[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setIsFetching(true);
      try {
        const res = await api.get(`/pedidos_cliente?limit=999999&offset=0`);
        const data = res.data;
        const items: Pedido[] = data.items ?? (Array.isArray(data) ? data : []);
        setAllPedidos(items);
      } catch (err) {
        console.error("Erro ao buscar pedidos:", err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchAll();
  }, []);

  // Opções únicas de categoria e status
  const categoriaOptions = useMemo(
    () =>
      Array.from(
        new Set(allPedidos.map((i) => i.categoria_produto).filter(Boolean) as string[])
      ).sort(),
    [allPedidos]
  );

  const statusOptions = useMemo(
    () =>
      Array.from(
        new Set(allPedidos.map((i) => i.status).filter(Boolean) as string[])
      ).sort(),
    [allPedidos]
  );

  // Filtragem local
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return allPedidos.filter((item) => {
      // Busca livre: cliente OU produto
      if (term) {
        const matchCliente = (item.nome_cliente ?? "").toLowerCase().includes(term);
        const matchProduto = (item.nome_produto ?? "").toLowerCase().includes(term);
        if (!matchCliente && !matchProduto) return false;
      }

      // Categoria (multi, OR)
      if (
        selectedCategoria.length > 0 &&
        !selectedCategoria.some(
          (c) => (item.categoria_produto ?? "").toLowerCase() === c.toLowerCase()
        )
      )
        return false;

      // Status (multi, OR)
      if (
        selectedStatus.length > 0 &&
        !selectedStatus.some(
          (s) => (item.status ?? "").toLowerCase() === s.toLowerCase()
        )
      )
        return false;

      // Intervalo de datas
      if (dateRange.data_inicio || dateRange.data_fim) {
        if (!item.data_pedido) return false;
        const dataPedido = item.data_pedido;
        
        if (dateRange.data_inicio && dataPedido < dateRange.data_inicio) return false;
        if (dateRange.data_fim && dataPedido > dateRange.data_fim) return false;
      }

      return true;
    });
  }, [allPedidos, search, selectedCategoria, selectedStatus, dateRange]);

  // Paginação local
  const total = filtered.length;
  const pedidos = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  return {
    pedidos,
    allFiltered: filtered,
    isFetching,
    total,
    categoriaOptions,
    statusOptions,
  };
}