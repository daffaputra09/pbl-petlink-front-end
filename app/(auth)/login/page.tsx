"use client";

import Link from "next/link";
import {
  PawPrint,
  Mail,
  Lock,
  Eye,
  LogIn,
} from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#EDF5F2] flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-xl bg-[#006B57] flex items-center justify-center shadow-sm">
            <PawPrint className="w-10 h-10 text-white" />
          </div>

          <h1 className="mt-5 text-5xl font-bold text-[#005847]">
            PetLink
          </h1>

          <p className="mt-3 text-gray-600 text-lg">
            Pantau kesehatan hewanmu, semua dalam satu tempat
          </p>
        </div>

        {/* Card Login */}
        <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          {/* Email */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Alamat Email
            </label>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <input
                type="email"
                placeholder="nama@email.com"
                className="w-full h-14 pl-12 pr-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#006B57]/20 focus:border-[#006B57]"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-semibold text-gray-800">
                Kata Sandi
              </label>

              <Link
                href="/forgot-password"
                className="text-sm text-[#006B57] hover:underline"
              >
                Lupa Kata Sandi?
              </Link>
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <input
                type="password"
                placeholder="Minimal 8 karakter"
                className="w-full h-14 pl-12 pr-12 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#006B57]/20 focus:border-[#006B57]"
              />

              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <Eye className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Button Login */}
          <button className="w-full h-14 bg-[#006B57] hover:bg-[#005847] text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition">
            Masuk
            <LogIn className="w-5 h-5" />
          </button>
        </div>

        {/* Register */}
        <div className="text-center mt-10">
          <span className="text-gray-600">
            Belum memiliki akun?{" "}
          </span>

          <Link
            href="/register"
            className="font-semibold text-[#006B57] hover:underline"
          >
            Daftar Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}