import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Calendar, Send, X, Loader2 } from "lucide-react";
import { useTicketDetalhe } from "../../hooks/useTicketDetalhe";

export default function SuporteDetalhePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ticket, loading, error, enviarMensagem } = useTicketDetalhe(id);
  const [mensagem, setMensagem] = useState("");

  const localFormatado =
    ticket?.cidade && ticket?.estado
      ? `${ticket.cidade} - ${ticket.estado}`
      : ticket?.cidade ?? ticket?.estado ?? null;

  const handleEnviar = async () => {
    if (!mensagem.trim()) return;
    try {
      await enviarMensagem(mensagem);
      setMensagem("");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7FE] flex items-center justify-center text-blue-500">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-[#F4F7FE] flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 font-bold">{error ?? "Ticket não encontrado."}</p>
        <button
          onClick={() => navigate("/suporte")}
          className="bg-blue-500 text-white px-6 py-2 rounded-xl"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FE]">
      <div className="max-w-7xl mx-auto px-8 pb-12">

        {/* Cabeçalho */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1a1a1a] mb-1">{ticket.nome_cliente}</h1>
            <h2 className="text-2xl font-bold text-blue-500 mb-4">{ticket.tipo_problema}</h2>

            <div className="flex items-center gap-6 text-sm text-gray-500 font-medium mb-4">
              {localFormatado && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={16} />
                  {localFormatado}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar size={16} />
                {ticket.data_abertura}
              </span>
              <span>ID: {ticket.id_ticket}</span>
            </div>

            <span className="inline-block border border-gray-400 text-gray-600 px-4 py-1 rounded-full text-xs font-medium capitalize">
              {ticket.status_ticket}
            </span>
          </div>

          {/* Breadcrumb */}
          <div
            className="text-sm font-medium mt-2 cursor-pointer"
            onClick={() => navigate("/suporte")}
          >
            <span className="text-gray-500 hover:underline">Suporte</span>
            <span className="text-gray-400 mx-1">&gt;</span>
            <span className="text-blue-500 hover:underline">Cliente</span>
          </div>
        </div>

        {/* Chat */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm flex flex-col min-h-[500px]">

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto mb-6 space-y-4">
            {ticket.historico && ticket.historico.length > 0 ? (
              ticket.historico.map((item, index) => (
                <div
                  key={item.id ?? index}
                  className="bg-[#F4F7FE] border border-[#E2E8F0] p-6 rounded-2xl text-sm text-gray-600 leading-relaxed max-w-[70%]"
                >
                  {item.mensagem}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">Nenhuma mensagem ainda.</p>
            )}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border border-[#E2E8F0] rounded-xl px-4 py-2 bg-white">
            <input
              type="text"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEnviar()}
              placeholder="Enviar mensagem"
              className="flex-1 outline-none text-sm text-gray-600 placeholder-gray-400 bg-transparent"
            />
            <button
              onClick={handleEnviar}
              className="bg-blue-500 text-white p-1.5 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Send size={16} />
            </button>
            <button
              onClick={() => setMensagem("")}
              className="text-gray-400 p-1 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
