"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/src/context/AuthContext";

interface UserItem {
  uid: string;
  nome: string;
  email: string;
  role: string;
  managerId?: string;
}

export default function UserList() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadUsers() {
    if (!user) return;

    let q;

    if (user.role === "DEV") {
      q = query(collection(db, "users"), orderBy("nome"));
    }

    if (user.role === "ADMIN") {
      q = query(
        collection(db, "users"),
        where("managerId", "==", user.uid),
        orderBy("nome")
      );
    }

    if (!q) return;

    const snap = await getDocs(q);

    const data = snap.docs.map(doc => ({
      uid: doc.id,
      ...(doc.data() as Omit<UserItem, "uid">),
    }));

    setUsers(data);
    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, [user?.role]);

  if (user?.role !== "DEV" && user?.role !== "ADMIN") return null;

  if (loading) {
    return (
      <p className="mt-6 text-center text-gray-500">
        Carregando usuários…
      </p>
    );
  }

  return (
    <div className="mt-10">
      <h2 className="text-lg font-semibold mb-4">
        Usuários sob sua gestão
      </h2>

      <ul className="space-y-3">
        {users.map(u => (
          <li
            key={u.uid}
            className="p-4 border rounded-lg flex justify-between items-center"
          >
            <div>
              <p className="font-medium">{u.nome}</p>
              <p className="text-sm text-gray-500">{u.email}</p>
            </div>

            <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100">
              {u.role}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
