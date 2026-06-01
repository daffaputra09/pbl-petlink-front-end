"use client";

import Link from "next/link";
import {
  Building2,
  User,
  ClipboardList,
  MapPin,
  Mail,
  Phone,
  Lock,
  Eye,
  ArrowRight,
  Cross,
} from "lucide-react";

export default function RegisterClinicPage() {
  return (
    <div className="min-h-screen bg-[#EDF5F2] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-2 text-[#006B57] font-bold text-2xl">
              <Cross className="w-8 h-8" />
              <span>PetLink</span>
            </div>

            <h1 className="mt-6 text-4xl font-bold text-gray-900">
              Pendaftaran Klinik
            </h1>

            <p className="mt-3 text-center text-gray-600 max-w-lg">
              Silakan lengkapi formulir di bawah ini untuk mendaftarkan
              klinik Anda di platform kami.
            </p>
          </div>

          <form className="space-y-5">
            {/* Nama Klinik */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Nama Klinik
              </label>

              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  type="text"
                  placeholder="Contoh: Klinik Hewan Sejahtera"
                  className="w-full h-12 pl-11 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B57]/20 focus:border-[#006B57]"
                />
              </div>
            </div>

            {/* Pemilik & SIP */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Nama Pemilik / Penanggung Jawab
                </label>

                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                  <input
                    type="text"
                    placeholder="Nama Lengkap"
                    className="w-full h-12 pl-11 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B57]/20 focus:border-[#006B57]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Nomor Izin Praktik
                </label>

                <div className="relative">
                  <ClipboardList className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                  <input
                    type="text"
                    placeholder="SIP / NIB Klinik"
                    className="w-full h-12 pl-11 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B57]/20 focus:border-[#006B57]"
                  />
                </div>
              </div>
            </div>

            {/* Alamat */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Alamat Klinik
              </label>

              <div className="relative">
                <MapPin className="absolute left-3 top-4 w-5 h-5 text-gray-400" />

                <textarea
                  rows={3}
                  placeholder="Alamat lengkap klinik Anda..."
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#006B57]/20 focus:border-[#006B57]"
                />
              </div>
            </div>

            {/* Email & Telepon */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Email Klinik
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                  <input
                    type="email"
                    placeholder="email@klinikku.com"
                    className="w-full h-12 pl-11 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B57]/20 focus:border-[#006B57]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Nomor Telepon
                </label>

                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                  <input
                    type="tel"
                    placeholder="0812xxxx"
                    className="w-full h-12 pl-11 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B57]/20 focus:border-[#006B57]"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Kata Sandi
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  type="password"
                  placeholder="Min. 8 Karakter"
                  className="w-full h-12 pl-11 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B57]/20 focus:border-[#006B57]"
                />

                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <Eye className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Checkbox */}
            <label className="flex items-start gap-3 text-sm text-gray-600">
              <input
                type="checkbox"
                className="mt-1 rounded border-gray-300"
              />

              <span>
                Saya menyetujui{" "}
                <Link
                  href="#"
                  className="font-semibold text-[#006B57]"
                >
                  Syarat & Ketentuan
                </Link>{" "}
                serta{" "}
                <Link
                  href="#"
                  className="font-semibold text-[#006B57]"
                >
                  Kebijakan Privasi
                </Link>{" "}
                PetLink
              </span>
            </label>

            {/* Button */}
            <button
              type="submit"
              className="w-full h-14 bg-[#006B57] hover:bg-[#005847] text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition"
            >
              Daftarkan Klinik Sekarang
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Login */}
          <div className="mt-8 pt-6 border-t text-center text-sm">
            <span className="text-gray-600">
              Sudah memiliki akun?{" "}
            </span>

            <Link
              href="/login"
              className="font-semibold text-[#006B57]"
            >
              Masuk di sini
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center gap-6 mt-6 text-xs text-gray-400">
        </div>
      </div>
    </div>
  );
}