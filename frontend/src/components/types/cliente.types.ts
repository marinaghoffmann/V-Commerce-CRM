import type { Pedido } from "./pedido.types";
import type { Ticket } from "./ticket.types";

export type TipoEventoCliente = "pedido" | "entrega" | "suporte";

export interface EventoCliente {
  tipo: TipoEventoCliente;
  titulo: string;
  data: string;
}

export interface ClienteApiResponse {
  id_cliente?: string | number;
  nome?: string;
  sobrenome?: string;
  email?: string;
  telefone_formatado?: string;
  segmento_cliente?: string;
  total_compras?: number;
  total_tickets?: number;
  receita_total_cliente?: number;
  ticket_medio?: number;
  data_ultima_compra?: string;
  data_primeira_compra?: string;
  cidade?: string;
  estado?: string;
  categoria_preferida?: string;
  produto_mais_comprado?: string;
  origem?: string;
  pedidos?: Array<Pick<Pedido, "id_pedido" | "data_pedido" | "status">>;
  tickets?: Array<Pick<Ticket, "id_ticket" | "data_abertura" | "tipo_problema" | "status_ticket">>;
}

export interface Cliente {
  id_cliente?: number;
  nome?: string;
  sobrenome?: string;
  email?: string;
  telefone_formatado?: string;
  segmento_cliente?: string;
  total_compras?: number;
  total_tickets?: number;
  receita_total_cliente?: number;
  ticket_medio?: number;
  data_ultima_compra?: string;
  data_primeira_compra?: string;
  cidade?: string;
  estado?: string;
  categoria_preferida?: string;
  produto_mais_comprado?: string;
  origem?: string;
  eventos?: EventoCliente[];
}
