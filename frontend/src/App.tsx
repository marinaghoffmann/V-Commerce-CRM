import { Routes, Route } from "react-router-dom";
import ClienteDetalhe from "./components/pages/ClienteDetalhe";
import Clientes from "./components/pages/Clientes";
import { PedidosPage } from "./components/pages/ProductPage";
import ProductsPage from "./components/pages/ProductsPage";
import SuportePage from "./components/pages/SuportePage";

function App() {
  return (
      <Routes>
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/clientes/:id" element={<ClienteDetalhe />} />
        <Route path="/pedidos" element={<PedidosPage />} />
        <Route path="/produtos" element={<ProductsPage />} />
        <Route path="/suporte" element={<SuportePage />} />
      </Routes>
  );
}

export default App;