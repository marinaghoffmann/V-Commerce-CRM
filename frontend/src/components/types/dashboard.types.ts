export interface KpiStatusItem {
  id: string;
  ano_venda: number;
  mes_venda: number;
  status: string;
  receita_total: number;
  ticket_medio: number;
  total_pedidos: number;
  total_clientes_unicos: number;
}

export interface MonthlyKpiItem {
  ano: number;
  mes: number;
  receita_total: number;
  total_pedidos: number;
  ticket_medio: number;
}

export interface MonthlyReviewProcessed {
  ano: number;
  mes: number;
  ruim: number;
  neutra: number;
  positiva: number;
}

export interface MonthlyTicketsProcessed{
  ano: number;
  mes: number;
  entrega_atrasada: number;
  entrega_no_prazo: number;
}