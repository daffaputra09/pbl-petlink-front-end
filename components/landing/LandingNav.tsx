"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PetLinkLogo } from "@/components/brand/PetLinkLogo";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#tentang", label: "Tentang" },
  { href: "#fitur", label: "Fitur" },
  { href: "#cara-kerja", label: "Cara Kerja" },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-emerald-100/80 bg-white/90 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <PetLinkLogo
            size={40}
            className={cn(
              "shadow-sm transition-shadow",
              !scrolled && "shadow-md shadow-emerald-900/20"
            )}
          />
          <span
            className={cn(
              "text-lg font-bold tracking-tight",
              scrolled ? "text-emerald-900" : "text-white"
            )}
          >
            PetLink
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-emerald-600",
                scrolled ? "text-emerald-800/80" : "text-white/90"
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            asChild
            variant="ghost"
            className={cn(
              scrolled
                ? "text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900"
                : "text-white hover:bg-white/10 hover:text-white"
            )}
          >
            <Link href="/login">Masuk Klinik</Link>
          </Button>
          <Button
            asChild
            className="bg-white text-emerald-800 hover:bg-emerald-50 shadow-md"
          >
            <Link href="/register/klinik">Daftar Klinik</Link>
          </Button>
        </div>

        <button
          type="button"
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-lg md:hidden",
            scrolled ? "text-emerald-800" : "text-white"
          )}
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-emerald-100 bg-white px-4 py-4 shadow-lg md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-emerald-900 hover:bg-emerald-50"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-emerald-100 pt-4">
            <Button asChild variant="outline" className="w-full border-emerald-200">
              <Link href="/login">Masuk Klinik</Link>
            </Button>
            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
              <Link href="/register/klinik">Daftar Klinik</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
