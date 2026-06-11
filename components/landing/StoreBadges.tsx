import type { ReactNode } from "react";

function GooglePlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M1.5 2.2v19.6c0 .5.3.9.7 1.1l.1.1 11.2-11.2V11L1.6 2.1l-.1.1z"
      />
      <path
        fill="currentColor"
        d="M14.8 12 4.2 1.4l9.2 5.3 1.4.8v8.8l-1.4.8-9.2-5.3L14.8 12z"
        opacity="0.85"
      />
      <path
        fill="currentColor"
        d="m16.2 10.2-2.4-1.4-8.6 8.6 2.4 1.4 8.6-8.6z"
      />
      <path
        fill="currentColor"
        d="M16.2 13.8 7.6 5.2l8.6 4.9 2.4-1.4c.4-.2.9-.2 1.3 0l1.5.9-2.4 2.4-2.8-1.2z"
      />
      <path
        fill="currentColor"
        d="m16.2 13.8 2.8 1.2 2.4-2.4-.9-.5c-.4-.2-.9-.2-1.3 0l-2.4 1.4z"
      />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function StoreBadge({
  icon,
  topLabel,
  storeName,
}: {
  icon: ReactNode;
  topLabel: string;
  storeName: string;
}) {
  return (
    <div
      className="inline-flex items-center gap-2.5 rounded-lg border border-emerald-900/10 bg-emerald-950 px-3 py-2 text-white select-none"
      aria-label={`${topLabel} ${storeName}`}
    >
      <span className="shrink-0 opacity-95">{icon}</span>
      <span className="flex flex-col leading-none">
        <span className="text-[9px] uppercase tracking-wide text-white/70">
          {topLabel}
        </span>
        <span className="mt-0.5 text-sm font-semibold">{storeName}</span>
      </span>
    </div>
  );
}

export function StoreBadges() {
  return (
    <div className="mt-5">
      <p className="text-xs font-medium text-emerald-800/60">Tersedia di</p>
      <div className="mt-2.5 flex flex-wrap gap-2.5">
        <StoreBadge
          icon={<GooglePlayIcon className="h-6 w-6" />}
          topLabel="Dapatkan di"
          storeName="Google Play"
        />
        <StoreBadge
          icon={<AppleIcon className="h-6 w-6" />}
          topLabel="Unduh di"
          storeName="App Store"
        />
      </div>
    </div>
  );
}
