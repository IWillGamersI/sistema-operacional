"use client";

import { useState } from "react";
import { registerUser } from "@/src/services/auth";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [role, setRole] = useState<
    "ADMIN" | "OPERACIONAL" | "PRODUCAO" | "EXPEDICAO" | "CLIENTE"
  >("OPERACIONAL");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const user = await registerUser({
        email,
        password,
        nome,
        role,
      });

      alert(`Usuário criado com sucesso. UID: ${user}`);
    } catch (error: any) {
      alert(error.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Cadastro de Usuário
        </h1>

        <p className="text-sm text-gray-500 mb-6">
          Crie um novo usuário e defina suas permissões
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Nome
            </label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Nome completo"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@empresa.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Perfil de acesso
            </label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ADMIN">Administrador</option>
              <option value="OPERACIONAL">Operacional</option>
              <option value="PRODUCAO">Produção</option>
              <option value="EXPEDICAO">Expedição</option>
              <option value="CLIENTE">Cliente</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition"
          >
            Cadastrar usuário
          </button>
        </form>
      </div>
    </div>
  );
}
