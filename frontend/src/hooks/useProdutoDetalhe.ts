import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import type { Product } from "../components/types/product.types";

export interface HistoricoMensal {
  ano: number;
  mes: number;
  receita_total: number;
  total_pedidos: number;
}

export interface TicketVinculado {
  id_ticket: string;
  nome_cliente: string;
  tipo_problema: string;
  status_ticket: string;
  data_abertura: string | null;
}

export interface TicketsPaginados {
  total: number;
  page: number;
  limit: number;
  items: TicketVinculado[];
}

export function useProdutoDetalhe(id: string | undefined) {
  const [produto, setProduto] = useState<Product | null>(null);
  const [historico, setHistorico] = useState<HistoricoMensal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    Promise.all([
      api.get<Product>(`/produto/${id}`),
      api.get<HistoricoMensal[]>(`/produto/${id}/historico-mensal`),
    ])
      .then(([prodRes, histRes]) => {
        setProduto(prodRes.data);
        setHistorico(histRes.data);
      })
      .catch((err) => {
        setError(err.message ?? String(err));
        setProduto(null);
        setHistorico([]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { produto, historico, loading, error };
}

export function useTicketsProduto(id: string | undefined, page: number, limit: number) {
  const [data, setData] = useState<TicketsPaginados | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    api
      .get<TicketsPaginados>(`/produto/${id}/tickets?page=${page}&limit=${limit}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message ?? String(err)))
      .finally(() => setLoading(false));
  }, [id, page, limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error };
}
