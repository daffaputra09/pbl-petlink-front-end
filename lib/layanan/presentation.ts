import {
  BriefcaseMedical,
  CalendarCheck2,
  Microscope,
  Scissors,
  Stethoscope,
  Syringe,
  TrendingUp,
} from "lucide-react";
import { createElement } from "react";
import type { ClinicServiceRow } from "@/hooks/use-clinic-services";
import type { Service, Stat } from "@/types/layanan";

const ICON_PRESETS = [
  { match: /vaksin|imun/i, icon: Syringe, color: "text-emerald-600", bg: "bg-emerald-50" },
  { match: /operasi|bedah/i, icon: Stethoscope, color: "text-red-500", bg: "bg-red-50" },
  { match: /groom/i, icon: Scissors, color: "text-orange-500", bg: "bg-orange-50" },
  { match: /dental|gigi/i, icon: BriefcaseMedical, color: "text-blue-500", bg: "bg-blue-50" },
  { match: /lab|diagnos/i, icon: Microscope, color: "text-purple-500", bg: "bg-purple-50" },
];

function formatRp(n: number) {
  return `Rp. ${n.toLocaleString("id-ID")}`;
}

export function clinicServiceToCard(row: ClinicServiceRow): Service {
  const preset =
    ICON_PRESETS.find((p) => p.match.test(row.name)) ?? ICON_PRESETS[0];
  const Icon = preset.icon;
  const tags: string[] = [];
  if (row.isHomeService) tags.push("Home");
  if (row.isClinicService) tags.push("Klinik");
  if (!row.isActive) tags.push("Nonaktif");

  return {
    id: row.id,
    name: row.name,
    category: row.isClinicService ? "LAYANAN KLINIK" : "LAYANAN",
    categoryColor: preset.color,
    price: formatRp(row.price),
    description: row.description ?? "",
    tags,
    icon: createElement(Icon, { className: `w-5 h-5 ${preset.color}` }),
    iconBg: preset.bg,
  };
}

export function buildServiceStats(services: ClinicServiceRow[]): Stat[] {
  const active = services.filter((s) => s.isActive).length;
  const avg =
    services.length > 0
      ? services.reduce((a, s) => a + s.price, 0) / services.length
      : 0;

  return [
    {
      label: "TOTAL LAYANAN",
      value: String(services.length),
      badge: `${active} Aktif`,
      badgeColor: "bg-emerald-50 text-emerald-700",
      icon: createElement(BriefcaseMedical, {
        className: "w-5 h-5 text-emerald-600",
      }),
      iconBg: "bg-emerald-50",
    },
    {
      label: "RATA-RATA HARGA",
      value: formatRp(Math.round(avg)),
      badge: "Per layanan",
      badgeColor: "bg-blue-50 text-blue-600",
      isLarge: true,
      icon: createElement(TrendingUp, {
        className: "w-5 h-5 text-blue-500",
      }),
      iconBg: "bg-blue-50",
    },
    {
      label: "DURASI RATA-RATA",
      value: services.length
        ? `${Math.round(
            services.reduce((a, s) => a + s.durationMinutes, 0) /
              services.length
          )} mnt`
        : "—",
      badge: "Estimasi",
      badgeColor: "bg-orange-50 text-orange-600",
      icon: createElement(CalendarCheck2, {
        className: "w-5 h-5 text-orange-500",
      }),
      iconBg: "bg-orange-50",
    },
  ];
}
