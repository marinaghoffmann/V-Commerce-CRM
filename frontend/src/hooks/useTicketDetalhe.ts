import { useEffect, useState } from "react";
import api from "../services/api";

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

    api.get(`/ticket/${id}`)
      .then((res) => setTicket(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const enviarMensagem = async (mensagem: string) => {
    if (!id || !mensagem.trim()) return;
    const response = await api.post(`/ticket/${id}/mensagem`, { mensagem });
    return response.data;
  };

  return { ticket, loading, error, enviarMensagem };
}