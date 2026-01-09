import {
  Users,
  LayoutDashboard,
  Package,
  Truck,
  Factory,
  UsbIcon,
  UserPlus,
  ChartBarStacked,
  Receipt,
} from "lucide-react";

export interface AdminMenuItem {
  label: string;
  href: string;
  roles: ("DEV" | "ADMIN" | "OPERACIONAL" | "PRODUCAO" | "EXPEDICAO")[];
  icon: any;
}

export const adminMenu: AdminMenuItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    roles: ["DEV", "ADMIN"],
    icon: LayoutDashboard,
  },
  {
    label: "Usuários",
    href: "/admin/users",
    roles: ["ADMIN"],
    icon: UserPlus,
  },
  {
    label: "Criar Usuários",
    href: "/admin/dev/users",
    roles: ["DEV"],
    icon: UserPlus,
  },
  {
    label: "Clientes",
    href: "/admin/clientes",
    roles: ["ADMIN", "OPERACIONAL"],
    icon: Users,
  },
  {
    label: "Produtos",
    href: "/admin/produtos",
    roles: ["ADMIN", "OPERACIONAL"],
    icon: Factory,
  },
  {
    label: "Fornecedores",
    href: "/admin/fornecedores",
    roles: ["ADMIN", "OPERACIONAL"],
    icon: Truck,
  },
  {
    label: "Categorias",
    href: "/admin/categorias",
    roles: ["ADMIN", "OPERACIONAL"],
    icon: ChartBarStacked,
  },
  {
    label: "Tabelas / Preços",
    href: "/admin/precos",
    roles: ["ADMIN", "OPERACIONAL"],
    icon: Receipt,
  },
  {
    label: "Upload Produtos",
    href: "/admin/upload-products",
    roles: ["ADMIN", "OPERACIONAL"],
    icon: Receipt,
  },
];
