import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../organisms/Navbar";
import { useClienteDetalhe } from "../../hooks/useClienteDetalhe";

interface Evento {
  tipo: "pedido" | "entrega" | "suporte";
  titulo: string;
  data: string;
}

function getInitials(nome?: string, sobrenome?: string) {
  return `${nome?.[0] ?? ""}${sobrenome?.[0] ?? ""}`.toUpperCase();
}

function getAvatarColor(nome?: string): string {
  const colors = [
    "bg-blue-500", "bg-purple-500", "bg-emerald-500",
    "bg-orange-400", "bg-pink-500", "bg-teal-500",
  ];
  return colors[(nome?.charCodeAt(0) ?? 0) % colors.length];
}

function gerarEventosMock(): Evento[] {
  return [
    { tipo: "pedido",  titulo: "Pedido #1042 criado e confirmado",  data: "12/05/2025 às 14:32" },
    { tipo: "entrega", titulo: "Pedido #1042 saiu para entrega",     data: "13/05/2025 às 09:10" },
    { tipo: "suporte", titulo: "Ticket #88 de suporte aberto",       data: "15/05/2025 às 16:45" },
    { tipo: "entrega", titulo: "Ticket #88 resolvido com sucesso",   data: "16/05/2025 às 11:00" },
    { tipo: "pedido",  titulo: "Pedido #1078 criado e confirmado",   data: "20/05/2025 às 10:20" },
    { tipo: "entrega", titulo: "Pedido #1078 entregue",              data: "22/05/2025 às 15:00" },
  ];
}

function EventoBullet({ tipo }: { tipo: Evento["tipo"] }) {
  if (tipo === "pedido") return <span className="w-3 h-3 rounded-full shrink-0 bg-blue-500" />;
  if (tipo === "entrega") return <span className="w-3 h-3 rounded-full shrink-0 bg-emerald-500" />;
  if (tipo === "suporte") return <span className="w-3 h-3 rounded-full shrink-0 bg-red-400" />;
  return null;
}

function ClientDetail(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, loading } = useClienteDetalhe(id);
  const [eventPage, setEventPage] = useState(1);
  const eventsPerPage = 4;

  if (loading) return (
    <div className="min-h-screen" style={{ backgroundColor: "#F4F7FE" }}>
      <Navbar />
      <div className="flex items-center justify-center pt-32 text-gray-400 text-sm">Carregando...</div>
    </div>
  );
  if (!data) return (
    <div className="min-h-screen" style={{ backgroundColor: "#F4F7FE" }}>
      <Navbar />
      <div className="flex items-center justify-center pt-32 text-gray-400 text-sm">Cliente não encontrado.</div>
    </div>
  );

  const eventos = gerarEventosMock();
  const totalEventPages = Math.ceil(eventos.length / eventsPerPage);
  const eventosPagina = eventos.slice((eventPage - 1) * eventsPerPage, eventPage * eventsPerPage);

  const nomeCompleto = `${data.nome ?? ""} ${data.sobrenome ?? ""}`.trim();
  const cidade = data.cidade ?? "—";
  const estado = data.estado ?? "—";
  const regiao = (data.cidade && data.estado) ? `${data.cidade}, ${data.estado}` : "—";
  const produtos = [data.categoria_preferida, data.produto_mais_comprado].filter(Boolean) as string[];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F4F7FE" }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 pb-12">

        {/* Breadcrumb */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1" style={{ letterSpacing: "-0.02em" }}>Sobre</h1>
          <div className="flex items-center gap-2 text-sm">
            <button
              className="text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
              onClick={() => navigate("/clientes")}
            >
              Clientes
            </button>
            <span className="text-gray-300">›</span>
            <span className="text-blue-500 font-medium">{nomeCompleto}</span>
          </div>
        </div>

        {/* Card de Identificação */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-8 py-6 flex items-center justify-between mb-6">
          <div className="flex items-center gap-5">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0 ${getAvatarColor(data.nome)}`}>
              {getInitials(data.nome, data.sobrenome)}
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{nomeCompleto}</div>
              <div className="text-sm text-gray-400 mb-3">{data.email}</div>
              <button className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-full hover:bg-blue-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.57a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z"/>
                </svg>
                Contato
              </button>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-1.5 border border-blue-400 text-blue-500 text-xs font-semibold rounded-full hover:bg-blue-50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Redes Sociais
            </button>
            <div className="flex items-center gap-1.5 text-sm text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {cidade}, {estado}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-6">

          {/* Card Geral */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span className="text-base font-bold text-gray-800">Geral</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Primeiro pedido", valor: data.data_primeira_compra ?? "—" },
                { label: "Freq. de interação", valor: `${data.total_compras ?? 0}x` },
                { label: "Último pedido", valor: data.data_ultima_compra ?? "—" },
                { label: "Freq. de suporte", valor: `${data.total_tickets ?? 0}x` },
              ].map(({ label, valor }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-xs text-gray-400 font-medium">{label}</span>
                  <span className="text-sm font-bold text-gray-800">{valor}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 my-5" />

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Produtos mais adquiridos</span>
                <div className="flex flex-wrap gap-2">
                  {produtos.map((p) => (
                    <span key={p} className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">{p}</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Região</span>
                <span className="text-sm text-gray-700">{regiao}</span>
              </div>
            </div>
          </div>

          {/* Card Atividade */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              <span className="text-base font-bold text-gray-800">Atividade</span>
            </div>

            <div className="flex flex-col gap-0 flex-1">
              {eventosPagina.map((ev, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center pt-1">
                    <EventoBullet tipo={ev.tipo} />
                    {i < eventosPagina.length - 1 && (
                      <span className="w-px flex-1 bg-gray-100 my-1" style={{ minHeight: "24px" }} />
                    )}
                  </div>
                  <div className="flex flex-col pb-5">
                    <span className="text-sm font-medium text-gray-800">{ev.titulo}</span>
                    <span className="text-xs text-gray-400 mt-0.5">{ev.data}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 my-5" />

            <div className="flex items-center justify-center gap-1.5">
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 font-medium"
                onClick={() => setEventPage((p) => Math.max(p - 1, 1))}
                disabled={eventPage === 1}
              >‹</button>
              {Array.from({ length: totalEventPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border font-medium transition-all duration-150 ${
                    p === eventPage
                      ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                      : "text-gray-500 border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                  onClick={() => setEventPage(p)}
                >{p}</button>
              ))}
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 font-medium"
                onClick={() => setEventPage((p) => Math.min(p + 1, totalEventPages))}
                disabled={eventPage === totalEventPages}
              >›</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ClientDetail;