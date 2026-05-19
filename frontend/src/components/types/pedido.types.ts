export interface Pedido {
  id_pedido:         string;
  nome_cliente:      string | null;
  nome_produto:      string | null;
  categoria_produto: string | null;
  status:            string | null;
  valor_pedido:      number | null;
  quantidade:        number | null;
  data_pedido:       string | null;
}
