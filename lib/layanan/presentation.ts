import type { ClinicService, ServiceStatItem } from "@/types/layanan";

export function formatServicePrice(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} menit`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h} jam`;
  return `${h} jam ${m} menit`;
}

export function channelLabels(service: ClinicService): string[] {
  const labels: string[] = [];
  if (service.isClinicService) labels.push("Klinik");
  if (service.isHomeService) labels.push("Home Service");
  return labels;
}

export function matchesServiceSearch(
  service: ClinicService,
  query: string
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    service.name,
    service.description ?? "",
    ...channelLabels(service),
    formatServicePrice(service.price),
    formatDuration(service.durationMinutes),
    service.isActive ? "aktif" : "nonaktif",
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}

export function sortServicesForDisplay(
  services: ClinicService[],
  filter: "Semua" | "Aktif" | "Nonaktif"
): ClinicService[] {
  const byName = [...services].sort((a, b) =>
    a.name.localeCompare(b.name, "id")
  );

  if (filter !== "Semua") return byName;

  return [
    ...byName.filter((s) => s.isActive),
    ...byName.filter((s) => !s.isActive),
  ];
}

export function buildServiceStats(services: ClinicService[]): ServiceStatItem[] {
  const active = services.filter((s) => s.isActive).length;
  const clinicCount = services.filter((s) => s.isClinicService && s.isActive).length;
  const homeCount = services.filter((s) => s.isHomeService && s.isActive).length;
  const avgPrice =
    services.length > 0
      ? services.reduce((sum, s) => sum + s.price, 0) / services.length
      : 0;
  const avgDuration =
    services.length > 0
      ? Math.round(
          services.reduce((sum, s) => sum + s.durationMinutes, 0) /
            services.length
        )
      : 0;

  return [
    {
      label: "Total Layanan",
      value: String(services.length),
      badge: `${active} aktif`,
      badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-100",
      iconKey: "total",
    },
    {
      label: "Channel Aktif",
      value: `${clinicCount} / ${homeCount}`,
      badge: "Klinik · Home",
      badgeClass: "bg-blue-50 text-blue-700 border border-blue-100",
      iconKey: "duration",
    },
    {
      label: "Rata-rata Harga",
      value: services.length ? formatServicePrice(Math.round(avgPrice)) : "—",
      badge: avgDuration ? `~${formatDuration(avgDuration)}` : "Estimasi",
      badgeClass: "bg-violet-50 text-violet-700 border border-violet-100",
      iconKey: "price",
    },
  ];
}
