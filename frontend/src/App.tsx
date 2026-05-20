import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./components/organisms/Navbar";
import ClientDetail from "./components/pages/ClientDetailPage";
import Clients from "./components/pages/ClientsPage";
import { OrdersPage } from "./components/pages/OrdersPage";
import ProductsPage from "./components/pages/ProductsPage";
import SuportePage from "./components/pages/SupportPage";
import Dashboard from "./components/pages/Dashboard";
import { AIFloatingButton } from "./components/organisms/AIFloatingButton";
import { ChatbotOverlay } from "./components/organisms/ChatbotOverlay";

function App() {
  // Controla se a janela do chat está aberta
  const [chatOpen, setChatOpen] = useState(false);

  // Guarda a última posição do botão para abrir a janela perto dele
  const [buttonPos, setButtonPos] = useState({ x: 0, y: 0 });

  return (
    <div className="min-h-screen block overflow-hidden bg-[#F4F7FE]">
      <Navbar />

      <Routes>
        <Route path="/"          element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clientes"  element={<Clients />} />
        <Route path="/clientes/:id" element={<ClientDetail />} />
        <Route path="/pedidos"   element={<OrdersPage />} />
        <Route path="/produtos"  element={<ProductsPage />} />
        <Route path="/suporte"   element={<SuportePage />} />
      </Routes>

      {/* ── Botão flutuante da IA ──────────────────────────────────────────
          Sempre visível. Ao ser clicado (sem arrasto), abre o chat.
          A posição é rastreada para abrir a janela perto dele.
      ────────────────────────────────────────────────────────────────────── */}
      <AIFloatingButton
        onClick={(pos) => {
          // Salva a posição atual do botão antes de abrir o chat
          setButtonPos(pos);
          setChatOpen(true);
        }}
      />

      {/* ── Janela do chat ────────────────────────────────────────────────
          Renderizada sobre tudo; fecha sem mover o botão.
      ────────────────────────────────────────────────────────────────────── */}
      {chatOpen && (
        <ChatbotOverlay
          onClose={() => setChatOpen(false)}
          buttonPos={buttonPos}
        />
      )}
    </div>
  );
}

export default App;