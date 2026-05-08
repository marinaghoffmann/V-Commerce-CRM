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
      <h1>{data.nome} {data.sobrenome}</h1>
      <p>{data.email}</p>
      <p>Segmento: {data.segmento_cliente}</p>
      <p>Pedidos: {data.total_compras}</p>
      <p>LTV: R$ {data.receita_total_cliente?.toFixed(2)}</p>
      <p>Ticket médio: R$ {data.ticket_medio?.toFixed(2)}</p>
      <p>Último pedido: {data.data_ultima_compra}</p>
    </div>
  );
}

export default ClienteDetalhe;