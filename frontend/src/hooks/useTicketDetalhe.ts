import { useEffect, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

interface Mensagem {
  id?: number;
  mensagem: string;
}

interface TicketDetalhe {
  id_ticket: number;
  nome_cliente: string;
  tipo_problema: string;
  status_ticket: string;
  data_abertura: string;
  cidade?: string;
  estado?: string;
  historico?: Mensagem[];
}

export function useTicketDetalhe(id: string | undefined) {
  const [ticket, setTicket] = useState<TicketDetalhe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    fetch(`${BASE_URL}/ticket/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Falha ao carregar os detalhes do ticket.");
        return r.json();
      })
      .then((data) => setTicket(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const enviarMensagem = async (mensagem: string) => {
    if (!id || !mensagem.trim()) return;
    const response = await fetch(`${BASE_URL}/ticket/${id}/mensagem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensagem }),
    });
    if (!response.ok) throw new Error("Falha ao enviar a mensagem.");
    return await response.json();
  };

  return { ticket, loading, error, enviarMensagem };
}