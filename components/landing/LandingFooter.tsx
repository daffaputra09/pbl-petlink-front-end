import Link from "next/link";
import { PetLinkLogo } from "@/components/brand/PetLinkLogo";
import { StoreBadges } from "./StoreBadges";

export function LandingFooter() {
  return (
    <footer className="border-t border-emerald-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <PetLinkLogo size={36} className="rounded-lg shadow-sm" />
              <span className="text-lg font-bold text-emerald-950">PetLink</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-emerald-800/60">
              Platform kesehatan hewan peliharaan yang menghubungkan customer,
              klinik, dan dokter hewan.
            </p>
            <StoreBadges />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-900">
                Platform
              </p>
              <ul className="mt-3 space-y-2 text-sm text-emerald-800/70">
                <li>
                  <a href="#tentang" className="hover:text-emerald-600">
                    Tentang
                  </a>
                </li>
                <li>
                  <a href="#fitur" className="hover:text-emerald-600">
                    Fitur
                  </a>
                </li>
                <li>
                  <a href="#cara-kerja" className="hover:text-emerald-600">
                    Cara Kerja
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-900">
                Klinik
              </p>
              <ul className="mt-3 space-y-2 text-sm text-emerald-800/70">
                <li>
                  <Link href="/login" className="hover:text-emerald-600">
                    Masuk Portal
                  </Link>
                </li>
                <li>
                  <Link href="/register/klinik" className="hover:text-emerald-600">
                    Daftar Klinik
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-emerald-100 pt-6 text-center text-xs text-emerald-700/60">
          © {new Date().getFullYear()} PetLink — Perawatan hewan lebih terorganisir
        </div>
      </div>
    </footer>
  );
}
