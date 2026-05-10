import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Cliente {
  id_cliente?: number;
  nome?: string;
  sobrenome?: string;
  email?: string;
  segmento_cliente?: string;
  total_compras?: number;
  receita_total_cliente?: number;
  ticket_medio?: number;
  data_ultima_compra?: string;
}

function ClienteDetalhe(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:8000/clientes/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Network response was not ok");
        return r.json();
      })
      .then((json: Cliente) => {
        setData(json);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Carregando...</p>;
  if (!data) return <p>Cliente não encontrado.</p>;

  return (
    <div>
      <h1>
        {data.nome} {data.sobrenome}
      </h1>
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
