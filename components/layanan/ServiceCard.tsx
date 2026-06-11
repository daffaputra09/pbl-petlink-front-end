"use client";

import {
  BriefcaseMedical,
  Clock,
  Home,
  Building2,
  Pencil,
  Power,
} from "lucide-react";
import type { ClinicService } from "@/types/layanan";
import {
  channelLabels,
  formatDuration,
  formatServicePrice,
} from "@/lib/layanan/presentation";

interface ServiceCardProps {
  service: ClinicService;
  onEdit: (service: ClinicService) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

export default function ServiceCard({
  service,
  onEdit,
  onToggleActive,
}: ServiceCardProps) {
  const channels = channelLabels(service);

  return (
    <div
      className={`bg-white rounded-xl border shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow ${
        service.isActive ? "border-gray-100" : "border-gray-200 opacity-75"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <BriefcaseMedical size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {service.name}
            </h3>
            <p className="text-lg font-bold text-emerald-700 mt-0.5">
              {formatServicePrice(service.price)}
            </p>
          </div>
        </div>
        <span
          className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full shrink-0 ${
            service.isActive
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-gray-100 text-gray-500 border border-gray-200"
          }`}
        >
          {service.isActive ? "Aktif" : "Nonaktif"}
        </span>
      </div>

      {service.description ? (
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
          {service.description}
        </p>
      ) : (
        <p className="text-sm text-gray-400 italic">Tanpa deskripsi</p>
      )}

      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 border border-gray-100">
          <Clock size={12} />
          {formatDuration(service.durationMinutes)}
        </span>
        {channels.map((ch) => (
          <span
            key={ch}
            className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${
              ch === "Home Service"
                ? "bg-violet-50 text-violet-700 border-violet-100"
                : "bg-blue-50 text-blue-700 border-blue-100"
            }`}
          >
            {ch === "Home Service" ? (
              <Home size={12} />
            ) : (
              <Building2 size={12} />
            )}
            {ch}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
        <button
          type="button"
          onClick={() => onEdit(service)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Pencil size={14} />
          Edit
        </button>
        <button
          type="button"
          onClick={() =>
            onToggleActive(service.id, !service.isActive)
          }
          className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
            service.isActive
              ? "border-orange-200 text-orange-600 hover:bg-orange-50"
              : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          }`}
          title={service.isActive ? "Nonaktifkan" : "Aktifkan kembali"}
        >
          <Power size={14} />
          {service.isActive ? "Off" : "On"}
        </button>
      </div>
    </div>
  );
}

interface ServiceGridProps {
  services: ClinicService[];
  onEdit: (service: ClinicService) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  emptyMessage?: string;
}

export function ServiceGrid({
  services,
  onEdit,
  onToggleActive,
  emptyMessage = "Belum ada layanan terdaftar.",
}: ServiceGridProps) {
  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 border border-dashed border-gray-200 rounded-xl">
        <BriefcaseMedical size={40} className="mb-3 opacity-40" />
        <p className="text-sm text-center px-4">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          onEdit={onEdit}
          onToggleActive={onToggleActive}
        />
      ))}
    </div>
  );
}
