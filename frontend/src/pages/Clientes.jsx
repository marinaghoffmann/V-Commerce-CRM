import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Clientes.css"; // Importando o arquivo que acabamos de criar!

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
    <div className="clientes-container">
      <h1 className="titulo-pagina">Clientes</h1>
      <p className="subtitulo-pagina">Visão 360 de cada cliente: segmento, pedidos e métricas</p>

      <div className="filtros-wrapper">
        <input
          className="input-busca"
          type="text"
          placeholder="Buscar por nome ou email..."
          value={busca}
          onChange={handleBusca}
        />
        <select className="select-filtro" value={status} onChange={handleStatus}>
          <option value="">Todos os Segmentos</option>
          <option value="Premium">Premium</option>
          <option value="Inativo">Inativo</option>
          <option value="Recorrente">Recorrente</option>
          <option value="Novo">Novo</option>
        </select>
        <select className="select-filtro" value={categoria} onChange={handleCategoria}>
          <option value="">Todas Categorias</option>
          <option value="Eletronicos">Eletrônicos</option>
          <option value="Moda">Moda</option>
          <option value="Casa">Casa</option>
        </select>
      </div>

      <div className="tabela-card">
        <table className="tabela-base">
          <thead className="tabela-header">
            <tr>
              <th className="tabela-th">Cliente</th>
              <th className="tabela-th">Segmento</th>
              <th className="tabela-th">Pedidos</th>
              <th className="tabela-th">LTV</th>
              <th className="tabela-th">Ticket Médio</th>
              <th className="tabela-th">Último Pedido</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {clientes.map((c) => (
              <tr 
                key={c.id_cliente} 
                onClick={() => navigate(`/clientes/${c.id_cliente}`)} 
                className="tabela-linha"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{c.nome} {c.sobrenome}</div>
                  <div className="text-sm text-gray-500">{c.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="status-badge">{c.segmento_cliente}</span>
                </td>
                <td className="tabela-td">{c.total_compras}</td>
                <td className="tabela-td font-medium text-blue-600">
                  R$ {c.receita_total_cliente?.toFixed(2)}
                </td>
                <td className="tabela-td">R$ {c.ticket_medio?.toFixed(2)}</td>
                <td className="px-6 py-4 text-gray-500 text-sm">{c.data_ultima_compra}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="paginacao-wrapper">
        <button 
          onClick={() => setPage((p) => Math.max(p - 1, 1))} 
          disabled={page === 1}
          className="btn-paginacao"
        >
          Anterior
        </button>
        <span className="text-gray-600 font-bold"> Página {page} </span>
        <button 
          onClick={() => setPage((p) => p + 1)} 
          disabled={clientes.length < limit}
          className="btn-paginacao"
        >
          Próximo
        </button>
      </div>
    </div>
  );
}

export default Clientes;