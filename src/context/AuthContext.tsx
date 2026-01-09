"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type UserRole =
  | "DEV"
  | "ADMIN"
  | "OPERACIONAL"
  | "PRODUCAO"
  | "EXPEDICAO"
  | "CLIENTE"


export type UserData = {
  uid: string;
  email: string;
  nome: string;
  role: UserRole;
};

type AuthContextType = {
  user: UserData | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const ref = doc(db, "users", firebaseUser.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        setUser(null);
        setLoading(false);
        return;
      }

      const data = snap.data();

      // 👇 AQUI começa a validação
      const role = data.role as UserRole;

      const allowedRoles: UserRole[] = [
        "DEV",
        "ADMIN",
        "OPERACIONAL",
        "PRODUCAO",
        "EXPEDICAO",
        "CLIENTE"
      ];

      if (!allowedRoles.includes(role)) {
        console.error("Role inválida:", role);
        setUser(null);
        setLoading(false);
        return;
      }
      // 👆 AQUI termina a validação

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email ?? "",
        nome: data.nome,
        role,
      });

      setLoading(false);

    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
