import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminHeader from "@/components/layout/AdminHeader";
import { AdminSessionProvider } from "@/lib/auth/admin-session";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminSessionProvider>
      <div className="flex min-h-screen items-start bg-gray-50">
        <AdminSidebar />
        <main className="min-h-screen min-w-0 flex-1">
          <AdminHeader />
          {children}
        </main>
      </div>
    </AdminSessionProvider>
  );
}
