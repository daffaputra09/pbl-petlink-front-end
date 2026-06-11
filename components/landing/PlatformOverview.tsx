"use client";

import { motion } from "framer-motion";
import { HeartHandshake, Building2, Users } from "lucide-react";

const pillars = [
  {
    icon: HeartHandshake,
    title: "Untuk Pemilik Hewan",
    description:
      "Aplikasi mobile untuk mencari klinik terdekat, mengelola profil hewan, memesan layanan klinik atau home service, konsultasi online via chat dengan dokter, dan pembayaran via Midtrans.",
  },
  {
    icon: Building2,
    title: "Untuk Klinik Hewan",
    description:
      "Portal web untuk mengelola dashboard, booking, jadwal dokter, layanan & harga, chat dengan customer, riwayat konsultasi, keuangan (pendapatan & penarikan dana), serta pengaturan profil klinik.",
  },
  {
    icon: Users,
    title: "Untuk Dokter Hewan",
    description:
      "Dokter tidak mendaftar sendiri — klinik mengundang via email. Setelah mengatur password, dokter mengelola jadwal praktik, booking & konsultasi via chat, serta komunikasi dengan customer dan klinik.",
  },
];

export function PlatformOverview() {
  return (
    <section id="tentang" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
            Tentang PetLink
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
            Satu platform, tiga ekosistem yang saling terhubung
          </h2>
          <p className="mt-4 text-base leading-relaxed text-emerald-800/70">
            PetLink dirancang agar alur perawatan hewan peliharaan berjalan mulus —
            dari pencarian layanan hingga tindak lanjut medis — tanpa perlu
            berpindah-pindah aplikasi.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {pillars.map((pillar, i) => (
            <motion.article
              key={pillar.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group rounded-2xl border border-emerald-100 bg-gradient-to-b from-emerald-50/50 to-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white transition-transform group-hover:scale-105">
                <pillar.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-emerald-950">
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-emerald-800/70">
                {pillar.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
