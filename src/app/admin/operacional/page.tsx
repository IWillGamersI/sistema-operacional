import { AdminSidebar } from "@/src/components/AdminSidebar";

export default function OperacionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-6 bg-gray-100 min-h-screen max-h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}
