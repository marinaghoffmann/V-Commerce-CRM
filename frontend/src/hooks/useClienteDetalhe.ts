import { useEffect, useState } from "react";
import type {
  Cliente,
  ClienteApiResponse,
  EventoCliente,
} from "../components/types/cliente.types";
import api from "../services/api";

function formatDateForTimeline(value?: string): string | null {
  if (!value) {
    return null;
  }

  const isoCandidate = value.includes("T") ? value : `${value}T00:00:00`;
  const date = new Date(isoCandidate);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const hasTimeInfo = value.includes("T");
  const dateFormatted = new Intl.DateTimeFormat("pt-BR").format(date);

  if (!hasTimeInfo) {
    return dateFormatted;
  }

  const timeFormatted = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  return `${dateFormatted} às ${timeFormatted}`;
}

function parseDateForSort(value?: string): number {
  if (!value) {
    return Number.NEGATIVE_INFINITY;
  }
  const isoCandidate = value.includes("T") ? value : `${value}T00:00:00`;
  const parsed = new Date(isoCandidate).getTime();
  return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
}

type EventoTimeline = EventoCliente & { timestamp: number };

function toEvento({
  tipo,
  titulo,
  data,
}: {
  tipo: EventoCliente["tipo"];
  titulo: string;
  data?: string;
}): EventoTimeline | null {
  const dataFormatada = formatDateForTimeline(data);
  if (!dataFormatada) {
    return null;
  }

  return {
    tipo,
    titulo,
    data: dataFormatada,
    timestamp: parseDateForSort(data),
  };
}

function buildEventos(payload: ClienteApiResponse): EventoCliente[] {
  const eventosPedidos = (payload.pedidos ?? [])
    .map((pedido) =>
      toEvento({
        tipo: "pedido",
        titulo: `Pedido #${pedido.id_pedido ?? "-"} criado e confirmado`,
        data: pedido.data_pedido ?? undefined,
      }),
    )
    .filter(Boolean) as EventoTimeline[];

  const eventosTickets = (payload.tickets ?? [])
    .map((ticket) => {
      const isEntrega = (ticket.tipo_problema ?? "").toLowerCase() === "entrega";
      return toEvento({
        tipo: isEntrega ? "entrega" : "suporte",
        titulo: `Ticket #${ticket.id_ticket ?? "-"} de ${ticket.tipo_problema ?? "suporte"} aberto`,
        data: ticket.data_abertura ?? undefined,
      });
    })
    .filter(Boolean) as EventoTimeline[];

  return [...eventosPedidos, ...eventosTickets]
    .sort((a, b) => b.timestamp - a.timestamp)
    .map(({ tipo, titulo, data }) => ({ tipo, titulo, data }));
}

function toClienteUI(payload: ClienteApiResponse): Cliente {
  const { pedidos: _pedidos, tickets: _tickets, ...clienteBase } = payload;

  return {
    ...clienteBase,
    id_cliente: payload.id_cliente ? Number(payload.id_cliente) : undefined,
    eventos: buildEventos(payload),
  };
}

export function useClienteDetalhe(id: string | undefined) {
  const [data, setData] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    api.get(`/clientes/${id}`)
      .then((res) => setData(toClienteUI(res.data as ClienteApiResponse)))
      .catch((err) => {
        setError(err.message);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
}
