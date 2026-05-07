import { BrowserRouter, Routes, Route } from "react-router-dom";
import ClienteDetalhe from "./pages/ClienteDetalhe";
import Clientes from "./pages/Clientes";
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/clientes" element={<Clientes />} />
        <Route path="/clientes/:id" element={<ClienteDetalhe />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App