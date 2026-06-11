"use client";

import { motion } from "framer-motion";
import {
  UserPlus,
  CalendarCheck,
  Stethoscope,
  CheckCircle2,
} from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Daftar & hubungkan",
    description:
      "Customer mendaftar di aplikasi mobile. Klinik mendaftar via portal web, melengkapi profil, jam operasional, dan rekening bank. Dokter diundang oleh klinik via email — tidak ada pendaftaran mandiri.",
  },
  {
    icon: CalendarCheck,
    step: "02",
    title: "Booking & konsultasi",
    description:
      "Customer memilih layanan (kunjungan klinik atau home service), memilih jadwal & dokter, lalu membayar. Konsultasi online dapat dijadwalkan terpisah dan berlangsung via chat.",
  },
  {
    icon: Stethoscope,
    step: "03",
    title: "Penanganan medis",
    description:
      "Dokter menerima booking/konsultasi di aplikasi. Klinik memantau operasional dari dashboard. Chat berjalan selama sesi aktif.",
  },
  {
    icon: CheckCircle2,
    step: "04",
    title: "Selesai & riwayat",
    description:
      "Status booking diperbarui hingga selesai. Riwayat tersimpan untuk customer, klinik, dan dokter. Klinik dapat menarik pendapatan ke rekening.",
  },
];

export function HowItWorks() {
  return (
    <section id="cara-kerja" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
            Cara Kerja
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
            Alur perawatan dari awal hingga selesai
          </h2>
          <p className="mt-4 text-base text-emerald-800/70">
            Setiap langkah terhubung secara real-time antar customer, klinik, dan
            dokter — tanpa proses manual yang berulang.
          </p>
        </motion.div>

        <div className="relative mt-16">
          <div className="absolute left-8 top-8 hidden h-[calc(100%-4rem)] w-px bg-gradient-to-b from-emerald-200 via-emerald-300 to-emerald-200 lg:left-1/2 lg:block" />

          <div className="space-y-10 lg:space-y-0">
            {steps.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`relative flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:gap-12 ${
                  i % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""
                }`}
              >
                <div
                  className={`flex items-center ${
                    i % 2 === 0 ? "lg:justify-end lg:pr-12" : "lg:justify-start lg:pl-12"
                  }`}
                >
                  <div className="relative max-w-md rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 shadow-sm">
                    <span className="text-xs font-bold text-emerald-500">
                      Langkah {item.step}
                    </span>
                    <h3 className="mt-2 text-lg font-semibold text-emerald-950">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-emerald-800/70">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center lg:justify-center">
                  <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
                    <item.icon className="h-7 w-7" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
