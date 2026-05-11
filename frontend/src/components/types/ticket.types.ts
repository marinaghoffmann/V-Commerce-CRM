export interface Ticket {
    id_ticket: string;
    id_cliente: string;
    nome_cliente: string | null;
    tipo_problema: string | null;
    status_ticket: string | null;
    data_abertura: string | null;
    data_resolucao: string | null;
    tempo_resolucao_horas: number | null;
    agente_suporte: string | null;
    nome_produto: string | null;
    categoria_produto: string | null;
    valor_pedido: number | null;
    total_pedidos_cliente: number;
    receita_total_cliente: number;
  }
  
  export type TicketStatus = "Aberto" | "Em andamento" | "Resolvido";