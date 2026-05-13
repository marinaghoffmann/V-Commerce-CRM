//import React from "react";
import {
  Package,
  TrendingUp,
  TrendingDown,
  Truck,
  RefreshCcw,
  Clock3,
  XCircle,
  CheckCircle2,
} from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import { Line, Pie, Bar } from "react-chartjs-2";

import { Navbar } from "../organisms/Navbar";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
);

function Dashboard() {
  const revenueData = {
    labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    datasets: [
      {
        data: [38, 12, 35, 27, 48, 71, 67, 49, 98, 14, 30, 12],
        borderColor: "#8B7CF8",
        backgroundColor: "rgba(139,124,248,0.18)",
        fill: true,
        tension: 0.45,
        pointRadius: 2,
      },
    ],
  };

  const statusData = {
    labels: [
      "Entregue",
      "Em trânsito",
      "Em processamento",
      "Atrasado",
      "Cancelado",
      "Devolvido",
    ],
    datasets: [
      {
        data: [45, 25, 10, 8, 5, 7],
        backgroundColor: [
          "#34A853",
          "#3B6FF6",
          "#7C4DFF",
          "#F97316",
          "#C62828",
          "#E0A800",
        ],
        borderWidth: 0,
      },
    ],
  };

  const horizontalData = {
    labels: ["Produto A", "Produto B", "Produto C", "Produto D", "Produto E"],
    datasets: [
      {
        data: [38.63, 11.43, 25.69, 24.01, 47.7],
        backgroundColor: "#9B8AFB",
        borderRadius: 10,
        barThickness: 8,
      },
    ],
  };

  const pedidos = [
    {
      id: "#4821",
      cliente: "João Pedro",
      status: "Entregue",
      valor: "R$ 1.250,00",
      data: "12/05/2026",
    },
    {
      id: "#4822",
      cliente: "Maria Clara",
      status: "Em trânsito",
      valor: "R$ 890,00",
      data: "12/05/2026",
    },
    {
      id: "#4823",
      cliente: "Lucas Silva",
      status: "Atrasado",
      valor: "R$ 430,00",
      data: "11/05/2026",
    },
    {
      id: "#4824",
      cliente: "Fernanda Lima",
      status: "Cancelado",
      valor: "R$ 210,00",
      data: "11/05/2026",
    },
  ];

  const cardStyle =
    "bg-[#F8F8F9] border border-[#CFCFD4] rounded-2xl p-5";

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Entregue":
        return "bg-green-100 text-green-700";

      case "Em trânsito":
        return "bg-blue-100 text-blue-700";

      case "Atrasado":
        return "bg-orange-100 text-orange-700";

      case "Cancelado":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-[#EDEFF6] py-6">
      {/* CONTAINER */}
      <div className="max-w-7xl mx-auto px-6">
        <Navbar />

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-5xl font-black tracking-tight text-[#2B2B2B]">
            Dashboard Mensal
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            CRM 360 visão geral mensal
          </p>
        </div>

        {/* TOP CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className={cardStyle}>
            <p className="text-sm text-[#333] font-medium mb-4">
              Receita mensal total
            </p>

            <h2 className="text-4xl font-black text-[#2E2E2E] mb-4">
              R$ 461.251,68
            </h2>

            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp size={14} />
              <span>8,1% vs. mês anterior</span>
            </div>
          </div>

          <div className={cardStyle}>
            <p className="text-sm text-[#333] font-medium mb-4">
              Total de pedidos mensal
            </p>

            <h2 className="text-4xl font-black text-[#2E2E2E] mb-4">
              18.340
            </h2>

            <div className="flex items-center gap-1 text-xs text-red-500">
              <TrendingDown size={14} />
              <span>5,3% vs. mês anterior</span>
            </div>
          </div>

          <div className={cardStyle}>
            <p className="text-sm text-[#333] font-medium mb-4">
              Ticket médio
            </p>

            <h2 className="text-4xl font-black text-[#2E2E2E] mb-4">
              R$ 215,90
            </h2>

            <div className="flex items-center gap-1 text-xs text-gray-700">
              <TrendingUp size={14} />
              <span>8,1% vs. mês anterior</span>
            </div>
          </div>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className={`${cardStyle} lg:col-span-2`}>
            <h2 className="text-xl font-semibold text-[#2B2B2B] mb-4">
              Gráfico de receita mensal
            </h2>

            <div className="h-[430px]">
              <Line
                data={revenueData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        color: "#E7E7EC",
                      },
                    },
                    y: {
                      grid: {
                        color: "#E7E7EC",
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className={cardStyle}>
            <h2 className="text-xl font-semibold text-[#2B2B2B] mb-6">
              Pedidos por status
            </h2>

            <div className="w-full flex justify-center mb-8">
              <div className="w-64">
                <Pie
                  data={statusData}
                  options={{
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-5 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={18}
                  className="text-white fill-[#34A853]"
                />
                <span>Entregue</span>
              </div>

              <div className="flex items-center gap-2">
                <Truck
                  size={18}
                  className="text-white fill-[#3B6FF6]"
                />
                <span>Em trânsito</span>
              </div>

              <div className="flex items-center gap-2">
                <Package
                  size={18}
                  className="text-white fill-[#7C4DFF]"
                />
                <span>Em processamento</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock3
                  size={18}
                  className="text-white fill-[#F97316]"
                />
                <span>Atrasado</span>
              </div>

              <div className="flex items-center gap-2">
                <XCircle
                  size={18}
                  className="text-white fill-[#C62828]"
                />
                <span>Cancelado</span>
              </div>

              <div className="flex items-center gap-2">
                <RefreshCcw
                  size={18}
                  className="text-white fill-[#E0A800]"
                />
                <span>Devolvido</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className={cardStyle}>
            <h2 className="text-xl font-semibold text-[#2B2B2B] mb-4">
              Produtos mais vendidos
            </h2>

            <div className="h-[220px]">
              <Bar
                data={horizontalData}
                options={{
                  indexAxis: "y",
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        color: "#E7E7EC",
                      },
                    },
                    y: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* TABLE */}
          <div className={`${cardStyle} lg:col-span-2 overflow-hidden`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-[#2B2B2B]">
                Últimos pedidos
              </h2>

              <button className="text-sm text-blue-600 font-medium hover:underline">
                Ver todos
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E7EB]">
                    <th className="text-left py-3 text-xs uppercase text-gray-500 tracking-wider">
                      Pedido
                    </th>

                    <th className="text-left py-3 text-xs uppercase text-gray-500 tracking-wider">
                      Cliente
                    </th>

                    <th className="text-left py-3 text-xs uppercase text-gray-500 tracking-wider">
                      Status
                    </th>

                    <th className="text-left py-3 text-xs uppercase text-gray-500 tracking-wider">
                      Valor
                    </th>

                    <th className="text-left py-3 text-xs uppercase text-gray-500 tracking-wider">
                      Data
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {pedidos.map((pedido) => (
                    <tr
                      key={pedido.id}
                      className="border-b border-[#ECECEC] hover:bg-white/60 transition-colors"
                    >
                      <td className="py-4 text-sm font-semibold text-gray-700">
                        {pedido.id}
                      </td>

                      <td className="py-4 text-sm text-gray-600">
                        {pedido.cliente}
                      </td>

                      <td className="py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                            pedido.status
                          )}`}
                        >
                          {pedido.status}
                        </span>
                      </td>

                      <td className="py-4 text-sm font-medium text-gray-700">
                        {pedido.valor}
                      </td>

                      <td className="py-4 text-sm text-gray-500">
                        {pedido.data}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;