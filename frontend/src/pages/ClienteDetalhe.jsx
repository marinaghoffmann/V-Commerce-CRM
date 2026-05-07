import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function ClienteDetalhe() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8000/clientes/${id}`)
      .then((r) => r.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Carregando...</p>;
  if (!data) return <p>Cliente não encontrado.</p>;

  return (
    <div>
      {/* Dados cadastrais */}
      <h1>{data.nome} {data.sobrenome}</h1>
      <p>{data.email}</p>
      <p>{data.telefone_formatado}</p>
      <p>{data.cidade}, {data.estado}</p>
      <p>Segmento: {data.segmento_cliente}</p>

      {/* Métricas */}
      <h2>Métricas</h2>
      <p>LTV: R$ {data.receita_total_cliente?.toFixed(2)}</p>
      <p>Total de pedidos: {data.total_compras}</p>
      <p>Ticket médio: R$ {data.ticket_medio?.toFixed(2)}</p>
      <p>Tickets abertos: {data.tickets_abertos}</p>
      <p>Tickets fechados: {data.tickets_fechados}</p>

      {/* Pedidos */}
      <h2>Pedidos</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Produto</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {data.pedidos?.length === 0 && (
            <tr><td colSpan={5}>Nenhum pedido encontrado</td></tr>
          )}
          {data.pedidos?.map((p) => (
            <tr key={p.id_pedido}>
              <td>#{p.id_pedido}</td>
              <td>{p.id_produto}</td>
              <td>R$ {p.valor_pedido?.toFixed(2)}</td>
              <td>{p.status}</td>
              <td>{p.data_pedido}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tickets */}
      <h2>Tickets de Suporte</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Problema</th>
            <th>Produto</th>
            <th>Status</th>
            <th>Abertura</th>
          </tr>
        </thead>
        <tbody>
          {data.tickets?.length === 0 && (
            <tr><td colSpan={5}>Nenhum ticket encontrado</td></tr>
          )}
          {data.tickets?.map((t) => (
            <tr key={t.id_ticket}>
              <td>{t.id_ticket}</td>
              <td>{t.tipo_problema}</td>
              <td>{t.nome_produto}</td>
              <td>{t.status_ticket}</td>
              <td>{t.data_abertura}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ClienteDetalhe;