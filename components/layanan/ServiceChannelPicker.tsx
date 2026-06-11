"use client";

import { Building2, Check, Home } from "lucide-react";

type ChannelKey = "clinic" | "home";

interface ServiceChannelPickerProps {
  isClinicService: boolean;
  isHomeService: boolean;
  onChange: (next: { isClinicService: boolean; isHomeService: boolean }) => void;
  error?: string;
}

function ChannelCard({
  title,
  description,
  icon,
  selected,
  onToggle,
  accent,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  onToggle: () => void;
  accent: "blue" | "violet";
}) {
  const activeStyles =
    accent === "blue"
      ? "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-100"
      : "border-violet-600 bg-violet-600 text-white shadow-md shadow-violet-100";

  const idleStyles =
    accent === "blue"
      ? "border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40"
      : "border-gray-200 bg-white hover:border-violet-300 hover:bg-violet-50/40";

  const iconIdle =
    accent === "blue"
      ? "bg-emerald-600 text-white"
      : "bg-violet-600 text-white";

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full text-left rounded-2xl border-2 p-4 transition-all duration-200 ${
        selected ? activeStyles : idleStyles
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
            selected ? "bg-white/20" : iconIdle
          }`}
        >
          {icon}
        </div>
        {selected ? (
          <span className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center">
            <Check size={14} className="text-white" strokeWidth={3} />
          </span>
        ) : null}
      </div>
      <h3
        className={`mt-4 text-base font-bold ${
          selected ? "text-white" : "text-gray-900"
        }`}
      >
        {title}
      </h3>
      <p
        className={`mt-2 text-sm leading-relaxed ${
          selected ? "text-white/80" : "text-gray-500"
        }`}
      >
        {description}
      </p>
    </button>
  );
}

export default function ServiceChannelPicker({
  isClinicService,
  isHomeService,
  onChange,
  error,
}: ServiceChannelPickerProps) {
  function toggle(key: ChannelKey) {
    if (key === "clinic") {
      onChange({ isClinicService: !isClinicService, isHomeService });
    } else {
      onChange({ isClinicService, isHomeService: !isHomeService });
    }
  }

  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1">
        Channel Layanan *
      </label>
      <p className="text-xs text-gray-500 mb-3">
        Pilih di mana layanan tersedia — sama seperti pilihan mode booking di
        aplikasi customer. Bisa memilih keduanya.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ChannelCard
          title="Kunjungi Klinik"
          description="Customer membawa hewan ke klinik untuk pemeriksaan dan tindakan medis."
          icon={<Building2 size={26} />}
          selected={isClinicService}
          onToggle={() => toggle("clinic")}
          accent="blue"
        />
        <ChannelCard
          title="Layanan Rumah"
          description="Tim klinik datang ke alamat customer sesuai jadwal yang dipilih."
          icon={<Home size={26} />}
          selected={isHomeService}
          onToggle={() => toggle("home")}
          accent="violet"
        />
      </div>
      {isClinicService && isHomeService ? (
        <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 mt-3">
          Layanan tersedia di klinik & ke rumah — customer bisa memilih saat
          booking.
        </p>
      ) : null}
      {error ? <p className="text-xs text-red-500 mt-2">{error}</p> : null}
    </div>
  );
}
