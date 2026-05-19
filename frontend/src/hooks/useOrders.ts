import { useState, useEffect, useMemo } from "react";
import type { Pedido } from "../components/types/pedido.types";
import type { PeriodoSelecionado } from "../components/atoms/PeriodoFilter";
import api from "../services/api";

interface UseOrdersArgs {
  page: number;
  pageSize: number;
  search: string;
  selectedCategoria: string[];
  selectedStatus: string[];
  selectedPeriodo: PeriodoSelecionado[];
}

export function useOrders({
  page,
  pageSize,
  search,
  selectedCategoria,
  selectedStatus,
  selectedPeriodo,
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

  // Pares únicos de mês/ano extraídos dos dados
  const periodoOptions = useMemo((): PeriodoSelecionado[] => {
    const seen = new Set<string>();
    const result: PeriodoSelecionado[] = [];
    for (const item of allPedidos) {
      if (!item.data_pedido) continue;
      const [anoStr, mesStr] = item.data_pedido.split("-");
      const ano = parseInt(anoStr, 10);
      const mes = parseInt(mesStr, 10);
      const key = `${ano}-${mes}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({ ano, mes });
      }
    }
    // Ordena do mais recente para o mais antigo
    return result.sort((a, b) =>
      a.ano !== b.ano ? b.ano - a.ano : b.mes - a.mes
    );
  }, [allPedidos]);

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

      // Período por mês/ano (multi, OR)
      if (selectedPeriodo.length > 0) {
        if (!item.data_pedido) return false;
        const [anoStr, mesStr] = item.data_pedido.split("-");
        const ano = parseInt(anoStr, 10);
        const mes = parseInt(mesStr, 10);
        const match = selectedPeriodo.some((p) => p.ano === ano && p.mes === mes);
        if (!match) return false;
      }

      return true;
    });
  }, [allPedidos, search, selectedCategoria, selectedStatus, selectedPeriodo]);

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
    periodoOptions,
  };
}