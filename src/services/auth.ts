import {
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { secondaryAuth } from "@/lib/firebaseAdminClient";

interface RegisterData {
  email: string;
  password: string;
  nome: string;
  role: "DEV" | "ADMIN" | "OPERACIONAL" | "PRODUCAO" | "EXPEDICAO" | 'CLIENTE';
  managerId?: string | null;
}

export async function registerUser(data: RegisterData) {
  // 🔐 cria usuário no Auth (instância secundária)
  const cred = await createUserWithEmailAndPassword(
    secondaryAuth,
    data.email,
    data.password
  );

  const uid = cred.user.uid;

  // 🔥 cria documento no Firestore com mesmo IUD
  await setDoc(doc(db, "users", uid), {
    nome: data.nome,
    email: data.email,
    role: data.role,
    managerId: data.managerId ?? null, // 🔑 ESSENCIAL
    createdAt: serverTimestamp(),
  });

  // ⚠️ limpa sessão secundária
  await signOut(secondaryAuth);

  return uid;
}
