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