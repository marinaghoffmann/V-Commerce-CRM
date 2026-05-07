import { BrowserRouter, Routes, Route } from "react-router-dom";
import ClienteDetalhe from "./pages/ClienteDetalhe";
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/clientes/:id" element={<ClienteDetalhe />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App