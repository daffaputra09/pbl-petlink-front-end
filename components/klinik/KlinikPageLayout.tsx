"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

/* ── Page shell ───────────────────────────────────────────── */

interface KlinikPageLayoutProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  maxWidth?: "6xl" | "7xl" | "full";
  backHref?: string;
  backLabel?: string;
}

const MAX_WIDTH_CLASS = {
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-none",
} as const;

/** Satu pola container untuk header & body agar margin kiri/kanan selalu selaras. */
export function klinikPageContainerClass(maxWidth: keyof typeof MAX_WIDTH_CLASS = "7xl") {
  return `${MAX_WIDTH_CLASS[maxWidth]} mx-auto w-full px-6`;
}

export function KlinikPageLayout({
  title,
  description,
  actions,
  children,
  maxWidth = "7xl",
  backHref,
  backLabel = "Kembali",
}: KlinikPageLayoutProps) {
  const containerClass = klinikPageContainerClass(maxWidth);

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      <header className="shrink-0 bg-white border-b border-gray-100 py-4">
        <div className={containerClass}>
          {backHref ? (
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-3"
            >
              <ArrowLeft size={16} />
              {backLabel}
            </Link>
          ) : null}
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900 truncate">{title}</h1>
              {description ? (
                <p className="text-sm text-gray-500 mt-0.5">{description}</p>
              ) : null}
            </div>
            {actions ? (
              <div className="flex items-center gap-2 shrink-0">{actions}</div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="flex-1 py-5">
        <div className={containerClass}>
          <div className="flex flex-col gap-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ── Shared states ────────────────────────────────────────── */

export function KlinikPageAlert({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}

import { Spinner } from "@/components/ui/Spinner";

export function KlinikPageLoading({ message = "Memuat..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
      <Spinner size={32} />
      <p className="text-sm mt-3 font-medium">{message}</p>
    </div>
  );
}

/* ── Filter tabs ──────────────────────────────────────────── */

interface KlinikFilterTabsProps<T extends string> {
  tabs: readonly T[];
  active: T;
  onChange: (tab: T) => void;
  trailing?: ReactNode;
}

export function KlinikFilterTabs<T extends string>({
  tabs,
  active,
  onChange,
  trailing,
}: KlinikFilterTabsProps<T>) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            active === tab
              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          {tab}
        </button>
      ))}
      {trailing ? <div className="ml-auto flex items-center gap-2">{trailing}</div> : null}
    </div>
  );
}

/* ── Section card ─────────────────────────────────────────── */

interface KlinikSectionCardProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function KlinikSectionCard({
  title,
  description,
  actions,
  children,
  className = "",
}: KlinikSectionCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${className}`}
    >
      {title ? (
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-gray-100">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
            {description ? (
              <p className="text-xs text-gray-400 mt-0.5">{description}</p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex items-center gap-2 shrink-0">{actions}</div>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}

/* ── Buttons ──────────────────────────────────────────────── */

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
};

export function KlinikPrimaryButton({
  icon,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 bg-[#1E6B4F] text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-[#165a3f] transition disabled:opacity-60 ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

export function KlinikSecondaryButton({
  icon,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 bg-white text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition disabled:opacity-60 ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
