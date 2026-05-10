import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/organisms/Navbar";
import "./Clientes.css";

interface Cliente {
  id_cliente: number;
  nome: string;
  sobrenome: string;
  email: string;
  segmento_cliente: string;
  total_compras: number;
  receita_total_cliente: number;
  ticket_medio: number;
  data_ultima_compra: string;
}

function getInitials(nome: string, sobrenome: string) {
  return `${nome?.[0] ?? ""}${sobrenome?.[0] ?? ""}`.toUpperCase();
}

function getSegmentStyle(segmento: string): string {
  switch (segmento?.toLowerCase()) {
    case "premium":    return "badge-premium";
    case "inativo":    return "badge-inativo";
    case "recorrente": return "badge-recorrente";
    case "novo":       return "badge-novo";
    default:           return "badge-default";
  }
}

function getAvatarColor(nome: string): string {
  const colors = ["avatar-blue","avatar-purple","avatar-green","avatar-orange","avatar-pink","avatar-teal"];
  const index = (nome?.charCodeAt(0) ?? 0) % colors.length;
  return colors[index];
}

function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams();
    if (busca) params.append("busca", busca);
    if (status) params.append("status", status);
    params.append("page", String(page));
    params.append("limit", String(limit));

    fetch(`http://localhost:8000/clientes/?${params.toString()}`)
      .then((r) => r.json())
      .then((json: Cliente[]) => {
        setClientes(json);
        setTotal((prev) => (json.length === limit ? Math.max(prev, page * limit + 1) : (page - 1) * limit + json.length));
      })
      .catch(() => setClientes([]));
  }, [busca, status, page]);

  const handleBusca = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusca(e.target.value);
    setPage(1);
  };
  const handleStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const inicio = (page - 1) * limit + 1;
  const fim = (page - 1) * limit + clientes.length;
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="cl-page">
      <Navbar />

      <div className="cl-content">
        <div className="cl-header">
          <h1 className="cl-title">Clientes</h1>
          <p className="cl-subtitle">Visão 360 de cada cliente: segmento, pedidos e métricas</p>
        </div>

        <div className="cl-filters">
          <div className="cl-search-wrapper">
            <svg className="cl-search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="cl-search"
              type="text"
              placeholder="Pesquisar por nome ou email..."
              value={busca}
              onChange={handleBusca}
            />
          </div>
          <select className="cl-select" value={status} onChange={handleStatus}>
            <option value="">Todos os Segmentos</option>
            <option value="Premium">Premium</option>
            <option value="Inativo">Inativo</option>
            <option value="Recorrente">Recorrente</option>
            <option value="Novo">Novo</option>
          </select>
        </div>

        <div className="cl-table-card">
          <table className="cl-table">
            <thead>
              <tr className="cl-thead-row">
                <th className="cl-th">Cliente</th>
                <th className="cl-th">Segmento</th>
                <th className="cl-th cl-th-center">Pedidos</th>
                <th className="cl-th cl-th-center">LTV</th>
                <th className="cl-th cl-th-center">Ticket Médio</th>
                <th className="cl-th cl-th-center">Último Pedido</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id_cliente} onClick={() => navigate(`/clientes/${c.id_cliente}`)} className="cl-row">
                  <td className="cl-td">
                    <div className="cl-cliente-cell">
                      <div className={`cl-avatar ${getAvatarColor(c.nome)}`}>
                        {getInitials(c.nome, c.sobrenome)}
                      </div>
                      <div>
                        <div className="cl-nome">{c.nome} {c.sobrenome}</div>
                        <div className="cl-email">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="cl-td">
                    <span className={`cl-badge ${getSegmentStyle(c.segmento_cliente)}`}>
                      {c.segmento_cliente}
                    </span>
                  </td>
                  <td className="cl-td cl-td-center">{c.total_compras}</td>
                  <td className="cl-td cl-td-center cl-ltv">
                    R$ {c.receita_total_cliente?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="cl-td cl-td-center">
                    R$ {c.ticket_medio?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="cl-td cl-td-center cl-data">{c.data_ultima_compra}</td>
                </tr>
              ))}
              {clientes.length === 0 && (
                <tr>
                  <td colSpan={6} className="cl-empty">Nenhum cliente encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="cl-pagination">
            <span className="cl-pagination-info">
              Mostrando {String(inicio).padStart(2, "0")} a {String(fim).padStart(2, "0")} de {String(total).padStart(2, "0")} resultados
            </span>
            <div className="cl-pagination-controls">
              <button className="cl-page-btn" onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button key={p} className={`cl-page-btn ${p === page ? "cl-page-btn--active" : ""}`} onClick={() => setPage(p)}>
                  {p}
                </button>
              ))}
              <button className="cl-page-btn" onClick={() => setPage((p) => p + 1)} disabled={clientes.length < limit}>›</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Clientes;