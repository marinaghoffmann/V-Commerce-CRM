import { useEffect, useState } from "react";
import api from "../services/api";
import type { Pedido } from "../components/types/pedido.types.ts";

type UseOrdersParams = {
  page: number;
  pageSize: number;

  search: string;

  selectedCategoria: string[];
  selectedStatus: string[];

  startDate: string | null;
  endDate: string | null;
};

export function useOrders({
  page,
  pageSize,
  search,
  selectedCategoria,
  selectedStatus,
  startDate,
  endDate,
}: UseOrdersParams) {
  const [pedidos, setPedidos] =
    useState<Pedido[]>([]);

  const [isFetching, setIsFetching] =
    useState(false);

  const [total, setTotal] =
    useState(0);

  // opções dos filtros
  const [categoriaOptions, setCategoriaOptions] =
    useState<string[]>([]);

  const [statusOptions, setStatusOptions] =
    useState<string[]>([]);

  // =========================
  // carregar pedidos
  // =========================
  useEffect(() => {
    const fetchPedidos = async () => {
      setIsFetching(true);

      try {
        const params = new URLSearchParams();

        params.append(
          "limit",
          String(pageSize)
        );

        params.append(
          "offset",
          String((page - 1) * pageSize)
        );

        // busca
        if (search.trim()) {
          params.append(
            "nome_cliente",
            search
          );

          params.append(
            "nome_produto",
            search
          );
        }

        // categoria
        if (selectedCategoria.length > 0) {
          params.append(
            "categoria_produto",
            selectedCategoria[0]
          );
        }

        // status
        if (selectedStatus.length > 0) {
          params.append(
            "status",
            selectedStatus[0]
          );
        }

        // range de datas
        if (startDate) {
          params.append(
            "data_inicio",
            startDate
          );
        }

        if (endDate) {
          params.append(
            "data_fim",
            endDate
          );
        }

        const res = await api.get(
          `/pedidos_cliente?${params.toString()}`
        );

        setPedidos(res.data.items ?? []);
        setTotal(res.data.total ?? 0);
      } catch (err) {
        console.error(
          "Erro ao buscar pedidos:",
          err
        );
      } finally {
        setIsFetching(false);
      }
    };

    fetchPedidos();
  }, [
    page,
    pageSize,
    search,
    selectedCategoria,
    selectedStatus,
    startDate,
    endDate,
  ]);

  // =========================
  // carregar filtros
  // =========================
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const res = await api.get(
          "/pedidos_cliente?limit=999999&offset=0"
        );

        const items: Pedido[] =
          res.data.items ?? [];

        setCategoriaOptions(
          Array.from(
            new Set(
              items
                .map(
                  (i) => i.categoria_produto
                )
                .filter(Boolean)
            )
          ).sort() as string[]
        );

        setStatusOptions(
          Array.from(
            new Set(
              items
                .map((i) => i.status)
                .filter(Boolean)
            )
          ).sort() as string[]
        );
      } catch (err) {
        console.error(
          "Erro ao carregar filtros:",
          err
        );
      }
    };

    fetchFilterOptions();
  }, []);

  return {
    pedidos,
    isFetching,
    total,
    categoriaOptions,
    statusOptions,
  };
}