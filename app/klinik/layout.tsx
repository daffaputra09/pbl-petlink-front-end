import KlinikShell from "@/components/klinik/KlinikShell";

export default function KlinikLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <KlinikShell>{children}</KlinikShell>;
}
