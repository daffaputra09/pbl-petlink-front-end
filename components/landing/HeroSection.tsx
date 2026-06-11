"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Smartphone,
  Monitor,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingImagePlaceholder } from "./LandingImagePlaceholder";

const stats = [
  { value: "3", label: "Peran terintegrasi" },
  { value: "24/7", label: "Chat & notifikasi" },
  { value: "1", label: "Platform terpadu" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 text-white">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <motion.div
        className="landing-orb absolute -left-24 top-20 h-72 w-72 rounded-full bg-teal-400/30 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="landing-orb absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl"
        animate={{ x: [0, -25, 0], y: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 sm:pb-28 sm:pt-32 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-200" />
              Platform kesehatan hewan peliharaan
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.25rem]">
              Perawatan hewan peliharaan,{" "}
              <span className="text-emerald-100">lebih mudah & terhubung</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-emerald-50/90 sm:text-lg">
              PetLink menghubungkan pemilik hewan, klinik, dan dokter hewan dalam
              satu ekosistem — booking layanan, konsultasi via chat, hingga
              pembayaran digital.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-white text-emerald-800 hover:bg-emerald-50 shadow-lg"
              >
                <Link href="/register/klinik">
                  Daftarkan Klinik
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
              >
                <a href="#fitur">Lihat Fitur</a>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap gap-6">
              {[
                { icon: Smartphone, text: "Customer & Dokter — Mobile" },
                { icon: Monitor, text: "Klinik — Portal Web" },
                { icon: Stethoscope, text: "Konsultasi & booking terpadu" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-2 text-sm text-emerald-50/90"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                    <Icon className="h-4 w-4" />
                  </span>
                  {text}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative mx-auto w-full max-w-md lg:max-w-none"
          >
            <LandingImagePlaceholder
              src="/landing/hero-app.png"
              alt="Tampilan aplikasi PetLink"
              label="Screenshot aplikasi PetLink"
              className="aspect-[4/5] w-full sm:aspect-[5/6]"
              priority
            />
            <motion.div
              className="absolute -bottom-4 -left-4 hidden rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur sm:block"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <p className="text-xs text-emerald-100/80">Booking aktif</p>
              <p className="text-lg font-semibold">Kunjungan Klinik</p>
            </motion.div>
          </motion.div>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-4 border-t border-white/15 pt-10 sm:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center sm:text-left">
              <p className="text-2xl font-bold sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs text-emerald-100/80 sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
