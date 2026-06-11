import Link from "next/link";
import { CalendarDays, Stethoscope, Wallet } from "lucide-react";
import { PetLinkLogo } from "@/components/brand/PetLinkLogo";

export function AuthMarketingLayout({
  children,
  heroTitle,
  heroSubtitle,
}: {
  children: React.ReactNode;
  heroTitle?: string;
  heroSubtitle?: string;
}) {
  return (
    <div className="min-h-dvh w-full lg:grid lg:grid-cols-2">
      <div className="relative hidden lg:flex min-h-dvh flex-col justify-between p-10 xl:p-12 bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 text-white overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <PetLinkLogo variant="full" size={44} />
              <span className="text-xl font-bold tracking-tight">PetLink</span>
            </Link>
          </div>
          <div className="relative space-y-4">
            <h1 className="text-3xl xl:text-4xl font-bold leading-tight tracking-tight">
              {heroTitle ?? "Portal Klinik Hewan"}
            </h1>
            <p className="text-emerald-50/90 text-base leading-relaxed max-w-md">
              {heroSubtitle ??
                "Kelola booking, dokter, layanan, dan keuangan klinik Anda dalam satu dashboard yang mudah digunakan."}
            </p>
            <ul className="space-y-3 pt-4">
              {[
                { icon: CalendarDays, text: "Jadwal & booking terpusat" },
                { icon: Stethoscope, text: "Manajemen dokter & layanan" },
                { icon: Wallet, text: "Pendapatan & penarikan dana" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                    <Icon size={18} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <p className="relative text-xs text-emerald-100/70">
            © PetLink — Perawatan hewan lebih terorganisir
          </p>
        </div>

      <div className="flex min-h-dvh w-full flex-col justify-center bg-white px-4 py-8 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <div className="lg:hidden mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-emerald-700 font-semibold"
            >
              <PetLinkLogo variant="full" size={36} className="rounded-lg" />
              PetLink Klinik
            </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
