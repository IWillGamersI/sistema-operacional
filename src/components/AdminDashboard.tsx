"use client";

import React, { useEffect, useState } from "react";
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

interface Stats {
  productsCount: number;
  categoriesCount: number;
  suppliersCount: number;
  salesCount: number;
  totalRevenue: number;
}

interface ProductProfit {
  name: string;
  profit: number;
}

interface CustomerTop {
  name: string;
  totalPurchases: number;
}

interface WeeklySales {
  week: string;
  total: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    productsCount: 0,
    categoriesCount: 0,
    suppliersCount: 0,
    salesCount: 0,
    totalRevenue: 0,
  });

  const [topProducts, setTopProducts] = useState<ProductProfit[]>([]);
  const [topCustomers, setTopCustomers] = useState<CustomerTop[]>([]);
  const [weeklySales, setWeeklySales] = useState<WeeklySales[]>([]);

  // Simulação de carregamento de dados
  useEffect(() => {
    // Aqui você vai buscar os dados do Firebase ou API
    setStats({
      productsCount: 120,
      categoriesCount: 8,
      suppliersCount: 15,
      salesCount: 340,
      totalRevenue: 45230,
    });

    setTopProducts([
      { name: "Produto A", profit: 12000 },
      { name: "Produto B", profit: 9500 },
      { name: "Produto C", profit: 7800 },
    ]);

    setTopCustomers([
      { name: "Cliente X", totalPurchases: 5000 },
      { name: "Cliente Y", totalPurchases: 4200 },
      { name: "Cliente Z", totalPurchases: 3900 },
    ]);

    setWeeklySales([
      { week: "01/01", total: 5000 },
      { week: "08/01", total: 7200 },
      { week: "15/01", total: 6800 },
      { week: "22/01", total: 9500 },
      { week: "29/01", total: 11000 },
    ]);
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Painel Administrativo</h1>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard title="Produtos" value={stats.productsCount} />
        <StatCard title="Categorias" value={stats.categoriesCount} />
        <StatCard title="Fornecedores" value={stats.suppliersCount} />
        <StatCard title="Vendas" value={stats.salesCount} />
        <StatCard title="Total Vendas" value={`R$ ${stats.totalRevenue.toLocaleString()}`} />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Produtos Mais Lucrativos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="profit" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Clientes com Mais Compras</h2>
          <ul className="space-y-2">
            {topCustomers.map(c => (
              <li key={c.name} className="flex justify-between p-2 border rounded-md">
                <span>{c.name}</span>
                <span>R$ {c.totalPurchases.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Card de estatística
function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center">
      <h3 className="text-gray-500">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
