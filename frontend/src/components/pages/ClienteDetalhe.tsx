import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../organisms/Navbar";
import "./ClienteDetalhe.css";

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
  data_primeira_compra?: string;
  origem?: string;
  regiao?: string;
  cidade?: string;
  estado?: string;
  produtos_mais_adquiridos?: string[];
}

interface Evento {
  tipo: "pedido" | "entrega" | "suporte";
  titulo: string;
  data: string;
}

function getInitials(nome?: string, sobrenome?: string) {
  return `${nome?.[0] ?? ""}${sobrenome?.[0] ?? ""}`.toUpperCase();
}

function getAvatarColor(nome?: string): string {
  const colors = ["avatar-blue","avatar-purple","avatar-green","avatar-orange","avatar-pink","avatar-teal"];
  const index = (nome?.charCodeAt(0) ?? 0) % colors.length;
  return colors[index];
}

function gerarEventosMock(): Evento[] {
  return [
    { tipo: "pedido",  titulo: "Pedido #1042 criado e confirmado",   data: "12/05/2025 às 14:32" },
    { tipo: "entrega", titulo: "Pedido #1042 saiu para entrega",      data: "13/05/2025 às 09:10" },
    { tipo: "suporte", titulo: "Ticket #88 de suporte aberto",        data: "15/05/2025 às 16:45" },
    { tipo: "entrega", titulo: "Ticket #88 resolvido com sucesso",    data: "16/05/2025 às 11:00" },
    { tipo: "pedido",  titulo: "Pedido #1078 criado e confirmado",    data: "20/05/2025 às 10:20" },
    { tipo: "entrega", titulo: "Pedido #1078 entregue",               data: "22/05/2025 às 15:00" },
  ];
}

function EventoBullet({ tipo }: { tipo: Evento["tipo"] }) {
  if (tipo === "pedido")  return <span className="cd-bullet cd-bullet--azul" />;
  if (tipo === "entrega") return <span className="cd-bullet cd-bullet--verde" />;
  if (tipo === "suporte") return <span className="cd-bullet cd-bullet--vermelho" />;
  return null;
}

function ClienteDetalhe(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [eventPage, setEventPage] = useState(1);
  const eventsPerPage = 4;

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:8000/clientes/${id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((json: Cliente) => setData(json))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="cd-page"><Navbar /><div className="cd-loading">Carregando...</div></div>
  );
  if (!data) return (
    <div className="cd-page"><Navbar /><div className="cd-loading">Cliente não encontrado.</div></div>
  );

  const eventos = gerarEventosMock();
  const totalEventPages = Math.ceil(eventos.length / eventsPerPage);
  const eventosPagina = eventos.slice((eventPage - 1) * eventsPerPage, eventPage * eventsPerPage);

  const nomeCompleto = `${data.nome ?? ""} ${data.sobrenome ?? ""}`.trim();
  const cidade = data.cidade ?? "Recife";
  const estado = data.estado ?? "PE";
  const origem = data.origem ?? "Redes Sociais";
  const regiao = data.regiao ?? "Recife, Pernambuco";
  const produtos = data.produtos_mais_adquiridos ?? ["Eletrônicos", "Acessórios", "Informática"];

  return (
    <div className="cd-page">
      <Navbar />

      <div className="cd-content">

        {/* Breadcrumb */}
        <div className="cd-breadcrumb">
          <h1 className="cd-page-title">Sobre</h1>
          <div className="cd-crumbs">
            <button className="cd-crumb-link" onClick={() => navigate("/clientes")}>Clientes</button>
            <span className="cd-crumb-sep">›</span>
            <span className="cd-crumb-active">{nomeCompleto}</span>
          </div>
        </div>

        {/* Card de Identificação */}
        <div className="cd-id-card">
          <div className="cd-id-left">
            <div className={`cd-avatar-lg ${getAvatarColor(data.nome)}`}>
              {getInitials(data.nome, data.sobrenome)}
            </div>
            <div>
              <div className="cd-nome-lg">{nomeCompleto}</div>
              <div className="cd-email-lg">{data.email}</div>
              <button className="cd-btn-contato">
                <svg xmlns="http://www.w3.org/2000/svg" className="cd-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.57a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z"/>
                </svg>
                Contato
              </button>
            </div>
          </div>
          <div className="cd-id-right">
            <button className="cd-btn-redes">
              <svg xmlns="http://www.w3.org/2000/svg" className="cd-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Redes Sociais
            </button>
            <div className="cd-localizacao">
              <svg xmlns="http://www.w3.org/2000/svg" className="cd-loc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {cidade}, {estado}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="cd-grid">

          {/* Card Geral */}
          <div className="cd-card">
            <div className="cd-card-header">
              <svg xmlns="http://www.w3.org/2000/svg" className="cd-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span className="cd-card-title">Geral</span>
            </div>

            <div className="cd-metricas-grid">
              <div className="cd-metrica">
                <span className="cd-metrica-label">Primeiro pedido</span>
                <span className="cd-metrica-valor">{data.data_primeira_compra ?? "—"}</span>
              </div>
              <div className="cd-metrica">
                <span className="cd-metrica-label">Freq. de interação</span>
                <span className="cd-metrica-valor">{data.total_compras ?? 0}x</span>
              </div>
              <div className="cd-metrica">
                <span className="cd-metrica-label">Último pedido</span>
                <span className="cd-metrica-valor">{data.data_ultima_compra ?? "—"}</span>
              </div>
              <div className="cd-metrica">
                <span className="cd-metrica-label">Freq. de suporte</span>
                <span className="cd-metrica-valor">2x</span>
              </div>
            </div>

            <div className="cd-divider" />

            <div className="cd-info-lista">
              <div className="cd-info-item">
                <span className="cd-info-label">Produtos mais adquiridos</span>
                <div className="cd-tags">
                  {produtos.map((p) => (
                    <span key={p} className="cd-tag">{p}</span>
                  ))}
                </div>
              </div>
              <div className="cd-info-item">
                <span className="cd-info-label">Origem</span>
                <span className="cd-info-valor">{origem}</span>
              </div>
              <div className="cd-info-item">
                <span className="cd-info-label">Região</span>
                <span className="cd-info-valor">{regiao}</span>
              </div>
            </div>
          </div>

          {/* Card Atividade */}
          <div className="cd-card">
            <div className="cd-card-header">
              <svg xmlns="http://www.w3.org/2000/svg" className="cd-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              <span className="cd-card-title">Atividade</span>
            </div>

            <div className="cd-timeline">
              {eventosPagina.map((ev, i) => (
                <div key={i} className="cd-timeline-item">
                  <div className="cd-timeline-marker">
                    <EventoBullet tipo={ev.tipo} />
                    {i < eventosPagina.length - 1 && <span className="cd-timeline-line" />}
                  </div>
                  <div className="cd-timeline-body">
                    <span className="cd-timeline-titulo">{ev.titulo}</span>
                    <span className="cd-timeline-data">{ev.data}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="cd-divider" />

            <div className="cd-pagination">
              <button className="cd-page-btn" onClick={() => setEventPage((p) => Math.max(p - 1, 1))} disabled={eventPage === 1}>‹</button>
              {Array.from({ length: totalEventPages }, (_, i) => i + 1).map((p) => (
                <button key={p} className={`cd-page-btn ${p === eventPage ? "cd-page-btn--active" : ""}`} onClick={() => setEventPage(p)}>{p}</button>
              ))}
              <button className="cd-page-btn" onClick={() => setEventPage((p) => Math.min(p + 1, totalEventPages))} disabled={eventPage === totalEventPages}>›</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ClienteDetalhe;