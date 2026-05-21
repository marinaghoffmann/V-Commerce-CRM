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
import { useChatbot } from "./contexts/ChatbotContext";

function App() {
  const { isOpen, buttonPos, toggleOverlay, closeOverlay } = useChatbot();

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

      <AIFloatingButton
        onClick={toggleOverlay}
      />

      {isOpen && (
        <ChatbotOverlay
          onClose={closeOverlay}
          buttonPos={buttonPos}
        />
      )}
    </div>
  );
}

export default App;