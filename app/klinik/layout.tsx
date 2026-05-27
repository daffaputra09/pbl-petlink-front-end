import KlinikSidebar from "@/components/layout/KlinikSidebar";
import Header from "@/components/layout/Header";

export default function KlinikLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <KlinikSidebar />
      <main className="flex-1 overflow-y-auto">
        <Header />
        <div className=""></div>
        {children}
      </main>
    </div>
  );
}
