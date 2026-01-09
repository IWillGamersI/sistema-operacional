"use client";

import { useEffect, useState } from "react";
import { registerUser } from "@/src/services/auth";
import { LogoutButton } from "./ButtonLogout";
import { CircleX, Trash2 } from "lucide-react";

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/src/context/AuthContext";

interface RegisterFormProps {
  allowedRoles: string[];
}

interface UserItem {
  uid: string;
  nome: string;
  email: string;
  role: string;
  managerId?: string | null;
  managerNome?: string; // novo campo
  gestorNome?: string; // novo campo
}

export default function RegisterForm({ allowedRoles }: RegisterFormProps) {
  const { user } = useAuth();

  const isDev = user?.role === "DEV";
  const isAdmin = user?.role === "ADMIN";

  // DEV pode criar qualquer role
  // ADMIN não pode criar ADMIN
  const availableRoles = isDev
    ? allowedRoles
    : allowedRoles.filter(r => r !== "ADMIN");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [role, setRole] = useState(availableRoles[0]);

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Carrega usuários conforme role
  // 🔹 Carrega usuários com nome do gestor
  async function loadUsers() {
    if (!user) return;

    let q;

    if (isDev) {
      q = query(collection(db, "users"), orderBy("nome"));
    }

    if (isAdmin) {
      q = query(collection(db, "users"), where("role", "!=", "DEV"));
    }

    if (!q) return;

    const snap = await getDocs(q);

    const usersData: UserItem[] = snap.docs.map(doc => ({
      uid: doc.id,
      ...(doc.data() as Omit<UserItem, "uid" | "gestorNome">),
    }));

    /// IDs únicos dos gestores
    const managerIds = Array.from(
      new Set(usersData.map(u => u.managerId).filter((id): id is string => !!id))
    );

    const managerMap: Record<string, string> = {};

    if (managerIds.length > 0) {
      // Busca apenas IDs válidos
      const managerDocs = await Promise.all(
        managerIds.map(id => getDoc(doc(db, "users", id)))
      );

      managerDocs.forEach(d => {
        if (d.exists()) {
          managerMap[d.id] = d.data().nome;
        }
      });
    }


    const finalUsers = usersData.map(u => ({
      ...u,
      gestorNome: u.managerId ? managerMap[u.managerId] || "--" : "DEV"
    }));

    setUsers(finalUsers);
  }




  useEffect(() => {
    loadUsers();
  }, [user?.role]);

  // 🔹 Criação de usuário
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      await registerUser({
        email,
        password,
        nome,
        role: role as any,
        managerId: isDev ? null : user.uid,
      });

      // limpa formulário
      setEmail("");
      setPassword("");
      setNome("");
      setRole(availableRoles[0]);

      await loadUsers();

      alert("Usuário criado com sucesso");
    } catch (error: any) {
      console.error("ERRO RAW:", error);
      alert("Erro ao criar usuário. Verifique o console.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteUser(uid: string) {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    const res = await fetch("/api/users/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uid }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error(err);
      throw new Error("Erro ao excluir usuário");
    }

    setUsers(prev => prev.filter(u => u.uid !== uid));
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">

        <h1 className="text-xl font-semibold mb-6 flex justify-between items-center">
          <span>Cadastro de Usuário</span>
          <LogoutButton icon={<CircleX size={20} />} />
        </h1>

        {/* Campos isca para enganar o autofill */}
        <input
          type="text"
          name="username"
          autoComplete="username"
          style={{ display: "none" }}
        />

        <input
          type="password"
          name="password"
          autoComplete="current-password"
          style={{ display: "none" }}
        />


        {/* FORMULÁRIO */}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4" autoComplete="off" >
          <input
            placeholder="Nome"
            value={nome}
            onChange={e => setNome(e.target.value)}
            className="border p-2 rounded-md border-zinc-400 outline-none"
            required
            autoComplete="off"
          />

          <input
            placeholder="E-mail"
            type="email"
            name="email_register"
            autoComplete="new-password"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border p-2 rounded-md"
          />


          <input
            placeholder="Senha"
            type="password"
            name="password_register"
            autoComplete="new-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border p-2 rounded-md"
          />


          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="border p-2 rounded-md border-zinc-400 outline-none"
          >
            {availableRoles.map(r => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Criando..." : "Criar usuário"}
          </button>
        </form>

        {/* LISTA DE USUÁRIOS */}
        {users.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold mb-3">
              Usuários Cadastrados
            </h2>

            <ul className="space-y-2">
              {users.map(u => (
                <li
                  key={u.uid}
                  className="flex justify-between items-center p-3 border rounded-md border-zinc-500"
                >
                  <div className="flex-1">
                    <p className="font-medium">{u.nome}</p>
                    <p className="text-sm text-gray-500">{u.email}</p>
                  </div>
                  <div className="text-center min-w-37.5">
                    <p className="text-xs text-gray-400">
                      {u.role}
                    </p>
                    <div className="flex text-xs text-gray-400 gap-1 text-center justify-center">
                      <div>
                        Gestor: 
                      </div>
                      <div>
                        {u.gestorNome}
                      </div>
                    </div>
                    
                  </div>
                  <button
                        onClick={() => handleDeleteUser(u.uid)}
                        className="text-red-600 hover:bg-red-600 hover:text-white text-sm cursor-pointer p-1 rounded-full transition-discrete "
                      >
                        <Trash2/>
                      </button>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}
