import { useEffect, useState } from "react";
import type { Cliente } from "../components/types/cliente.types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export function useClienteDetalhe(id: string | undefined) {
  const [data, setData] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetch(`${BASE_URL}/clientes/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Erro ao buscar detalhes do cliente");
        return r.json();
      })
      .then((json: Cliente) => setData(json))
      .catch((err) => {
        setError(err.message);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
}
