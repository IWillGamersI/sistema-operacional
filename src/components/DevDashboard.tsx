"use client";

import { useEffect, useState } from "react";

type OnlineUser = {
  nome: string;
  role: string;
  tempoOnline: string;
};

export function DevDashboard() {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [systemStatus, setSystemStatus] = useState("Operacional");

  // Simulação de dados
  useEffect(() => {
    // Usuários online fictícios
    setOnlineUsers([
      { nome: "Maria", role: "ADMIN", tempoOnline: "15 min" },
      { nome: "João", role: "OPERACIONAL", tempoOnline: "42 min" },
      { nome: "Carlos", role: "PRODUCAO", tempoOnline: "5 min" },
    ]);

    // Status do sistema
    setSystemStatus("Operacional");
  }, []);

  return (
    <div>
        <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">Dashboard DEV</h1>

        {/* Status do Sistema */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
            <h2 className="text-xl font-semibold mb-2">Status do Sistema</h2>
            <p className="text-green-600 font-bold">{systemStatus}</p>
        </div>

        {/* Usuários Online */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Usuários Online</h2>
            <table className="w-full text-left border-collapse">
            <thead>
                <tr className="border-b">
                <th className="p-2">Nome</th>
                <th className="p-2">Role</th>
                <th className="p-2">Tempo Online</th>
                </tr>
            </thead>
            <tbody>
                {onlineUsers.map((user, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-2">{user.nome}</td>
                    <td className="p-2 font-semibold">{user.role}</td>
                    <td className="p-2">{user.tempoOnline}</td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        </div>
    </div>
  );
}
