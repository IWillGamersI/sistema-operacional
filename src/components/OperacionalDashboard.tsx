"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface DailyMetrics {
  totalVendas: number;
  pedidosPendentes: number;
  pedidosEmAndamento: number;
  pedidosFinalizados: number;
}

interface WeeklySales {
  week: string;
  total: number;
}

interface TopProducts {
  name: string;
  quantidade: number;
}

export function OperacionalDashboard() {
  const [metrics, setMetrics] = useState<DailyMetrics>({
    totalVendas: 0,
    pedidosPendentes: 0,
    pedidosEmAndamento: 0,
    pedidosFinalizados: 0,
  });

  const [weeklySales, setWeeklySales] = useState<WeeklySales[]>([]);
  const [topProducts, setTopProducts] = useState<TopProducts[]>([]);

  useEffect(() => {
    // Simulação de dados
    setMetrics({
      totalVendas: 120,
      pedidosPendentes: 10,
      pedidosEmAndamento: 45,
      pedidosFinalizados: 65,
    });

    setWeeklySales([
      { week: "01/01", total: 50 },
      { week: "08/01", total: 70 },
      { week: "15/01", total: 60 },
      { week: "22/01", total: 80 },
      { week: "29/01", total: 95 },
    ]);

    setTopProducts([
      { name: "Produto A", quantidade: 40 },
      { name: "Produto B", quantidade: 35 },
      { name: "Produto C", quantidade: 28 },
    ]);
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Dashboard Operacional</h1>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard title="Total Vendas" value={metrics.totalVendas} />
        <MetricCard title="Pendentes" value={metrics.pedidosPendentes} />
        <MetricCard title="Em Andamento" value={metrics.pedidosEmAndamento} />
        <MetricCard title="Finalizados" value={metrics.pedidosFinalizados} />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendas semanais */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Vendas por Semana</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#4F46E5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Produtos mais movimentados */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Produtos Mais Movimentados</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantidade" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// Card de métrica
function MetricCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center">
      <h3 className="text-gray-500">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
