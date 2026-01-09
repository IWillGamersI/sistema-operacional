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

interface ProductionMetrics {
  pedidosEmProducao: number;
  pedidosAtrasados: number;
  producaoDiaria: number;
  metaDiaria: number;
}

interface WeeklyProduction {
  week: string;
  total: number;
}

interface TopProdutosProducao {
  name: string;
  quantidade: number;
}

export function ProducaoDashboard() {
  const [metrics, setMetrics] = useState<ProductionMetrics>({
    pedidosEmProducao: 0,
    pedidosAtrasados: 0,
    producaoDiaria: 0,
    metaDiaria: 0,
  });

  const [weeklyProduction, setWeeklyProduction] = useState<WeeklyProduction[]>([]);
  const [topProdutos, setTopProdutos] = useState<TopProdutosProducao[]>([]);

  useEffect(() => {
    // Simulação de dados
    setMetrics({
      pedidosEmProducao: 45,
      pedidosAtrasados: 5,
      producaoDiaria: 120,
      metaDiaria: 150,
    });

    setWeeklyProduction([
      { week: "01/01", total: 100 },
      { week: "08/01", total: 120 },
      { week: "15/01", total: 110 },
      { week: "22/01", total: 130 },
      { week: "29/01", total: 125 },
    ]);

    setTopProdutos([
      { name: "Produto A", quantidade: 40 },
      { name: "Produto B", quantidade: 35 },
      { name: "Produto C", quantidade: 28 },
    ]);
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Dashboard de Produção</h1>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard title="Pedidos em Produção" value={metrics.pedidosEmProducao} />
        <MetricCard title="Pedidos Atrasados" value={metrics.pedidosAtrasados} />
        <MetricCard title="Produção Diária" value={metrics.producaoDiaria} />
        <MetricCard title="Meta Diária" value={metrics.metaDiaria} />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Produção Semanal</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyProduction}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#4F46E5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Produtos em Produção</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProdutos}>
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
