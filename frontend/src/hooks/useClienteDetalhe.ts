import { useEffect, useState } from "react";
import type { Cliente } from "../components/types/cliente.types";
import api from "../services/api";

export function useClienteDetalhe(id: string | undefined) {
  const [data, setData] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    api.get(`/clientes/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => {
        setError(err.message);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
}
