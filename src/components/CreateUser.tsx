import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export async function createUser({
    email,
    password,
    nome,
    role,
}: {
    email: string;
    password: string;
    nome: string;
    role: string;
}) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "users", cred.user.uid), {
        nome,
        email,
        role,
        createdAt: new Date(),
    });
}
