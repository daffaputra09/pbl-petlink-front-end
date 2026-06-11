"use client";

import { useState, type ElementType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  CalendarDays,
  MessageCircle,
  CreditCard,
  PawPrint,
  Home,
  LayoutDashboard,
  Users,
  Wallet,
  Clock,
  Settings,
  ClipboardList,
  CalendarCheck,
  MessageSquare,
  UserCircle,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LandingImagePlaceholder } from "./LandingImagePlaceholder";

type Role = "customer" | "clinic" | "doctor";

const roles: { id: Role; label: string; subtitle: string }[] = [
  {
    id: "customer",
    label: "Customer",
    subtitle: "Aplikasi Mobile",
  },
  {
    id: "clinic",
    label: "Klinik",
    subtitle: "Portal Web",
  },
  {
    id: "doctor",
    label: "Dokter",
    subtitle: "Aplikasi Mobile",
  },
];

const features: Record<
  Role,
  {
    title: string;
    description: string;
    image: string;
    imageLabel: string;
    items: { icon: ElementType; text: string }[];
  }
> = {
  customer: {
    title: "Semua kebutuhan perawatan hewan di genggaman",
    description:
      "Customer menggunakan aplikasi mobile PetLink untuk menemukan klinik, memesan layanan, dan berkomunikasi dengan tim medis secara real-time.",
    image: "/landing/customer-app.png",
    imageLabel: "Screenshot aplikasi Customer",
    items: [
      { icon: Search, text: "Cari klinik hewan terdekat berdasarkan lokasi" },
      { icon: PawPrint, text: "Kelola profil & data hewan peliharaan" },
      {
        icon: CalendarDays,
        text: "Booking layanan kunjungan klinik atau home service",
      },
      { icon: MessageCircle, text: "Jadwalkan konsultasi online via chat dengan dokter" },
      { icon: MessageCircle, text: "Chat dengan klinik & dokter (termasuk push notifikasi)" },
      { icon: CreditCard, text: "Pembayaran digital via Midtrans & riwayat transaksi" },
      { icon: Home, text: "Lacak status booking dari penjadwalan hingga selesai" },
    ],
  },
  clinic: {
    title: "Kelola operasional klinik dari satu dashboard",
    description:
      "Klinik mendaftar dan mengoperasikan bisnis melalui portal web — mulai dari manajemen dokter hingga laporan keuangan.",
    image: "/landing/clinic-dashboard.png",
    imageLabel: "Screenshot dashboard Klinik",
    items: [
      { icon: LayoutDashboard, text: "Dashboard ringkasan booking, pendapatan & statistik" },
      { icon: CalendarCheck, text: "Kelola booking: konfirmasi, reschedule & status" },
      { icon: Users, text: "Undang dokter via email & atur jadwal praktik" },
      { icon: ClipboardList, text: "Atur layanan, harga, durasi & channel (klinik/rumah)" },
      { icon: MessageSquare, text: "Pusat pesan & chat dengan customer maupun dokter" },
      { icon: Wallet, text: "Keuangan: pantau pendapatan & ajukan penarikan dana" },
      { icon: Settings, text: "Pengaturan profil klinik, jam operasional & foto" },
    ],
  },
  doctor: {
    title: "Fokus pada pasien, jadwal terorganisir",
    description:
      "Dokter tidak mendaftar sendiri — klinik mengundang via email, dokter mengatur password melalui web, lalu mengelola praktik harian lewat aplikasi mobile.",
    image: "/landing/doctor-app.png",
    imageLabel: "Screenshot aplikasi Dokter",
    items: [
      { icon: Mail, text: "Akun aktif setelah undangan email dari klinik & atur password" },
      { icon: UserCircle, text: "Profil dokter & edit data pribadi" },
      { icon: Clock, text: "Lihat jadwal praktik & blok waktu konsultasi" },
      { icon: CalendarDays, text: "Detail booking pasien — kunjungan klinik & home service" },
      { icon: MessageCircle, text: "Konsultasi online terjadwal — komunikasi sepenuhnya via chat" },
      { icon: MessageCircle, text: "Chat terpisah dengan customer dan klinik" },
      { icon: ClipboardList, text: "Riwayat penanganan & detail konsultasi" },
    ],
  },
};

export function RoleFeatures() {
  const [active, setActive] = useState<Role>("customer");
  const current = features[active];

  return (
    <section id="fitur" className="bg-emerald-50/60 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
            Fitur Lengkap
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
            Dirancang untuk setiap peran
          </h2>
        </motion.div>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => setActive(role.id)}
              className={cn(
                "rounded-full px-5 py-2.5 text-sm font-medium transition-all",
                active === role.id
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
                  : "bg-white text-emerald-800 hover:bg-emerald-100"
              )}
            >
              {role.label}
              <span className="ml-1.5 text-xs opacity-70">· {role.subtitle}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="mt-12 grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
          >
            <div>
              <h3 className="text-2xl font-bold text-emerald-950">
                {current.title}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-emerald-800/70">
                {current.description}
              </p>
              <ul className="mt-8 space-y-3">
                {current.items.map(({ icon: Icon, text }) => (
                  <li
                    key={text}
                    className="flex items-start gap-3 rounded-xl bg-white/80 px-4 py-3 text-sm text-emerald-900 shadow-sm"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                      <Icon className="h-4 w-4" />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            <LandingImagePlaceholder
              src={current.image}
              alt={current.imageLabel}
              label={current.imageLabel}
              className="aspect-[4/5] w-full max-w-sm mx-auto lg:max-w-none"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
