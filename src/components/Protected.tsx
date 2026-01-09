"use client";

import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Protected({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: string[];
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !roles.includes(user.role))) {
      router.push("/login");
    }
  }, [user, loading, roles, router]);

  if (loading) return null;

  return <>{children}</>;
}
