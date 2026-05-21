export interface Product {
  id_produto: string;
  nome_produto: string;
  categoria: string | null;
  preco: number | null;
  unidades_vendidas: number | null;
  estoque_disponivel: number | null;
  receita_total: number | null;
  media_nota_produto: number | null;
  total_avaliacoes: number | null;
  indicador_crescimento: number | 0;
  flag_alto_ticket: boolean | false;
  data_cadastro: string | null;
}

export type ProductListResponse = Product[];