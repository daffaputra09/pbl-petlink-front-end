import KlinikSidebar from "@/components/layout/KlinikSidebar";
import Header from "@/components/layout/Header";

export default function KlinikLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-start bg-gray-50">
      <KlinikSidebar />
      <main className="min-h-screen min-w-0 flex-1">
        <Header />
        {children}
      </main>
    </div>
  );
}
