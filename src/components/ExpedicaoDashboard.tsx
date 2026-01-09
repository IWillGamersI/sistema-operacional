"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface ShippingMetrics {
  pedidosProntos: number;
  pedidosEnviados: number;
  pedidosAtrasados: number;
}

interface WeeklyShipping {
  week: string;
  total: number;
}

interface TopTransportadoras {
  name: string;
  quantidade: number;
}

export function ExpedicaoDashboard() {
  const [metrics, setMetrics] = useState<ShippingMetrics>({
    pedidosProntos: 0,
    pedidosEnviados: 0,
    pedidosAtrasados: 0,
  });

  const [weeklyShipping, setWeeklyShipping] = useState<WeeklyShipping[]>([]);
  const [topTransportadoras, setTopTransportadoras] = useState<TopTransportadoras[]>([]);

  useEffect(() => {
    // Simulação de dados
    setMetrics({
      pedidosProntos: 20,
      pedidosEnviados: 80,
      pedidosAtrasados: 5,
    });

    setWeeklyShipping([
      { week: "01/01", total: 30 },
      { week: "08/01", total: 50 },
      { week: "15/01", total: 45 },
      { week: "22/01", total: 60 },
      { week: "29/01", total: 55 },
    ]);

    setTopTransportadoras([
      { name: "Transportadora A", quantidade: 30 },
      { name: "Transportadora B", quantidade: 20 },
      { name: "Transportadora C", quantidade: 15 },
    ]);
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Dashboard de Expedição</h1>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard title="Pedidos Prontos" value={metrics.pedidosProntos} />
        <MetricCard title="Pedidos Enviados" value={metrics.pedidosEnviados} />
        <MetricCard title="Pedidos Atrasados" value={metrics.pedidosAtrasados} />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Pedidos Enviados por Semana</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyShipping}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#4F46E5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Top Transportadoras</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topTransportadoras}>
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

function MetricCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center">
      <h3 className="text-gray-500">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
