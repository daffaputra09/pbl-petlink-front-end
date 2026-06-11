"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 px-6 py-14 text-center text-white sm:px-12 sm:py-16"
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Siap menghubungkan klinik Anda?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-emerald-50/90">
              Daftarkan klinik hewan Anda di PetLink dan mulai terima booking,
              kelola dokter, serta pantau keuangan — semua dari satu portal.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="bg-white text-emerald-800 hover:bg-emerald-50"
              >
                <Link href="/register/klinik">
                  Daftar Klinik Gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <Link href="/login">Sudah punya akun? Masuk</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
