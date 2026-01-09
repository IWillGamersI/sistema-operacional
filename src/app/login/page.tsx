"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/src/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();


  // só redireciona quando o AuthContext terminou de carregar
  useEffect(() => {
    if (!authLoading && user) {
      redirectByRole(user.role, router);
    }

  }, [user, authLoading, router]);


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // AuthContext cuida do resto
    } catch {
      setError("Email ou senha inválidos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <img src="/logo.png" alt="Logo" className="mx-auto mb-6 h-32" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
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
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
/*
// Função pura, sem efeitos colaterais no render
function redirectByRole(role: string, router: any) {
  if (role === "DEV") router.push("/dev/users");
  else if (role === "ADMIN") router.push("/admin");
  else if (role === "OPERACIONAL") router.push("/operacional"); 
  else router.push("/");
}
*/
function redirectByRole(role: string, router: any) {
  if (["DEV", "ADMIN", "OPERACIONAL", "PRODUCAO", "EXPEDICAO"].includes(role)) {
    router.push("/admin");
  } else {
    router.push("/");
  }
}
