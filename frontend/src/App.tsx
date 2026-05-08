import { BrowserRouter, Routes, Route } from "react-router-dom";
import ClienteDetalhe from "./pages/ClienteDetalhe";
import Clientes from "./pages/Clientes";
import { PedidosPage } from "./components/pages/ProductPage";
import ProductsPage from "./components/pages/ProductsPage";
import './App.css'

function App() {
  return (
      <Routes>
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/clientes/:id" element={<ClienteDetalhe />} />
        <Route path="/pedidos" element={<PedidosPage />} />
        <Route path="/produtos" element={<ProductsPage />} />
      </Routes>
  );
}

export default App
