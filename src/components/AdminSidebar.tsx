"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminMenu } from "@/src/config/adminMenu";
import { useAuth } from "@/src/context/AuthContext";
import clsx from "clsx";
import { LogoutButton } from "./ButtonLogout";
import { LogOut } from "lucide-react";

export function AdminSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  return (
    <aside className="w-80 min-h-screen bg-zinc-900 text-white p-4">
      <div className="">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            PAINEL {user.role}  
          </h2>
          <div className="flex items-center justify-end">
            <LogoutButton icon={<LogOut />} texto="Sair" />
          </div>
        </div>
        <div className="text-xs mb-5 text-zinc-400">
            Olá, {user?.nome && `${user.nome}`}        
        </div>

      </div>

      <nav className="space-y-1 flex flex-col">
          <div className="flex-1">
            {adminMenu
              .filter(item =>
                        (item.roles as string[]).includes(user.role)
                    )
              .map(item => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  
                    <Link
                      key={item.href}
                      href={item.href}
                      className={clsx(
                        "flex items-center gap-3 px-3 py-2 rounded-md transition",
                        active
                          ? "bg-blue-600 text-white"
                          : "text-zinc-300 hover:bg-zinc-800"
                      )}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </Link>
                  
                );
              })}
          </div>
          
      </nav>
    </aside>
  );
}
