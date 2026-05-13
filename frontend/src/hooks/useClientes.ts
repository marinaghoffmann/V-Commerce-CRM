import { useEffect, useState } from "react";
import type { Cliente } from "../components/types/cliente.types";
import api from "../services/api";

interface UseClientesArgs {
  busca: string;
  status: string;
  page: number;
  limit: number;
}

export function useClientes({ busca, status, page, limit }: UseClientesArgs) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (busca) params.append("busca", busca);
    if (status) params.append("status", status);
    params.append("page", String(page));
    params.append("limit", String(limit));

    const countParams = new URLSearchParams();
    if (busca) countParams.append("busca", busca);
    if (status) countParams.append("status", status);

    Promise.all([
      api.get(`/clientes/?${params.toString()}`).then((r) => r.data),
      api.get(`/clientes/count?${countParams.toString()}`).then((r) => r.data),
    ])
      .then(([clientesJson, countJson]) => {
        setClientes(clientesJson);
        setTotal(countJson.total ?? 0);
      })
      .catch((err) => {
        setClientes([]);
        setError(err.message ?? String(err));
      })
      .finally(() => setLoading(false));
  }, [busca, status, page, limit]);

  return { clientes, total, loading, error };
}
