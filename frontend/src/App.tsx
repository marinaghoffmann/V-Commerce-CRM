import { Routes, Route } from "react-router-dom";

import { Navbar } from "./components/organisms/Navbar";
import { PedidosPage } from "./components/pages/ProductPage";

// Teste da paginação para checar seu funcionamento

function Dashboard() {
  return <h1>Dashboard</h1>;
}


function Pedidos() {
  return <h1>Pedidos</h1>;
}

function Produtos() {
  return <h1 className="text-color-blue">Produtos</h1>;
}

function Suporte() {
  return <h1>Suporte</h1>;
}

function Assistente() {
  return <h1>Assistente</h1>;
}

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/suporte" element={<Suporte />} />
        <Route path="/assistente" element={<Assistente />} />
        <Route path="/pedidos" element={<PedidosPage />} />
      </Routes>
    </>
  );
}