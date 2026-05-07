import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("");
  const [categoria, setCategoria] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams();
    if (busca) params.append("busca", busca);
    if (status) params.append("status", status);
    if (categoria) params.append("categoria", categoria);
    params.append("page", page);
    params.append("limit", limit);

    fetch(`http://localhost:8000/clientes/?${params.toString()}`)
      .then((r) => r.json())
      .then(setClientes);
  }, [busca, status, categoria, page]);

  const handleBusca = (e) => { setBusca(e.target.value); setPage(1); };
  const handleStatus = (e) => { setStatus(e.target.value); setPage(1); };
  const handleCategoria = (e) => { setCategoria(e.target.value); setPage(1); };

  return (
    <div>
      <h1>Clientes</h1>
      <p>Visão 360 de cada cliente: segmento, pedidos e métricas</p>

      <input
        type="text"
        placeholder="Buscar por nome ou email..."
        value={busca}
        onChange={handleBusca}
      />

      <select value={status} onChange={handleStatus}>
        <option value="">Todos</option>
        <option value="Premium">Premium</option>
        <option value="Inativo">Inativo</option>
        <option value="Recorrente">Recorrente</option>
        <option value="Novo">Novo</option>
      </select>

      <select value={categoria} onChange={handleCategoria}>
        <option value="">Todas categorias</option>
        <option value="Eletronicos">Eletrônicos</option>
        <option value="Moda">Moda</option>
        <option value="Casa">Casa</option>
        <option value="Beleza">Beleza</option>
        <option value="Brinquedos">Brinquedos</option>
      </select>

      <table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Segmento</th>
            <th>Pedidos</th>
            <th>LTV</th>
            <th>Ticket médio</th>
            <th>Último pedido</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c) => (
            <tr key={c.id_cliente} onClick={() => navigate(`/clientes/${c.id_cliente}`)} style={{ cursor: "pointer" }}>
              <td>{c.nome} {c.sobrenome}<br /><small>{c.email}</small></td>
              <td>{c.segmento_cliente}</td>
              <td>{c.total_compras}</td>
              <td>R$ {c.receita_total_cliente?.toFixed(2)}</td>
              <td>R$ {c.ticket_medio?.toFixed(2)}</td>
              <td>{c.data_ultima_compra}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>
          Anterior
        </button>
        <span> Página {page} </span>
        <button onClick={() => setPage((p) => p + 1)} disabled={clientes.length < limit}>
          Próximo
        </button>
      </div>
    </div>
  );
}

export default Clientes;