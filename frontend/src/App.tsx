import { Routes, Route } from "react-router-dom";
import ClientDetail from "./components/pages/ClientDetailPage";
import Clients from "./components/pages/ClientsPage";
import { OrdersPage } from "./components/pages/OrdersPage";
import ProductsPage from "./components/pages/ProductsPage";
import SuportePage from "./components/pages/SupportPage";

function App() {
  return (
      <Routes>
        <Route path="/clientes" element={<Clients />} />
        <Route path="/clientes/:id" element={<ClientDetail />} />
        <Route path="/pedidos" element={<OrdersPage />} />
        <Route path="/produtos" element={<ProductsPage />} />
        <Route path="/suporte" element={<SuportePage />} />
      </Routes>
  );
}

export default App;