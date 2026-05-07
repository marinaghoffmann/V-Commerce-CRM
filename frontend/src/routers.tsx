export function Dashboard() {
  return <h1>Dashboard</h1>;
}

export function Clientes() {
  return <h1>Clientes</h1>;
}

import { Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/clientes" element={<Clientes />} />
    </Routes>
  );
}