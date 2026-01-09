"use client";

import { useAuth } from "@/src/context/AuthContext";
import  { AdminDashboard }  from "@/src/components/AdminDashboard"; // Seu dashboard atual
import  { DevDashboard }  from "@/src/components/DevDashboard";
import { OperacionalDashboard } from "@/src/components/OperacionalDashboard"
import { ProducaoDashboard } from "@/src/components/ProducaoDashboard";
import { ExpedicaoDashboard } from "@/src/components/ExpedicaoDashboard";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) return <p>Carregando...</p>;
  if (!user) return <p>Sem permissão</p>;

  switch (user.role) { 
    case "DEV":
      return <DevDashboard />;
    case "ADMIN":
      return <AdminDashboard />;
    case "OPERACIONAL":
      return <OperacionalDashboard />;
    case "PRODUCAO":
      return <ProducaoDashboard/>
    case "EXPEDICAO":
      return <ExpedicaoDashboard/>
    default:
      return <p>Sem permissão</p>;
  }
}
