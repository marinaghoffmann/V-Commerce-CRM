import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ClienteDetalhe from "./pages/ClienteDetalhe";
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
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