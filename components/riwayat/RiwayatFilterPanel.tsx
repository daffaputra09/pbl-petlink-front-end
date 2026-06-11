"use client";

import {
  Ban,
  CheckCircle2,
  Filter,
  Layers,
  MessageCircle,
  RotateCcw,
  Search,
  Stethoscope,
  X,
} from "lucide-react";
import DoctorSearchCombobox from "@/components/riwayat/DoctorSearchCombobox";
import { Input } from "@/components/ui/input";
import {
  CONSULTATION_STATUS_FILTER_OPTIONS,
  consultationStatusFilterLabel,
  type ConsultationStatusFilter,
} from "@/lib/riwayat/consultation-status";
import { cn } from "@/lib/utils";
import type { Doctor } from "@/types/dokter";
import type {
  HandlingKindFilter,
  RiwayatStatusFilter,
  RiwayatTab,
} from "@/types/riwayat";

const BOOKING_STATUS_OPTIONS: {
  value: RiwayatStatusFilter;
  label: string;
  icon: typeof CheckCircle2;
}[] = [
  { value: "Semua", label: "Semua status", icon: Layers },
  { value: "Selesai", label: "Selesai", icon: CheckCircle2 },
  { value: "Dibatalkan", label: "Dibatalkan", icon: Ban },
];

const KIND_OPTIONS: {
  value: HandlingKindFilter;
  label: string;
  icon: typeof Stethoscope;
  activeClass: string;
}[] = [
  {
    value: "Semua",
    label: "Semua jenis",
    icon: Layers,
    activeClass: "bg-gray-800 text-white border-gray-800",
  },
  {
    value: "Booking",
    label: "Booking",
    icon: Stethoscope,
    activeClass: "bg-[#1E6B4F] text-white border-[#1E6B4F]",
  },
  {
    value: "Konsultasi",
    label: "Konsultasi",
    icon: MessageCircle,
    activeClass: "bg-[#1565C0] text-white border-[#1565C0]",
  },
];

type Props = {
  activeTab: RiwayatTab;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: RiwayatStatusFilter;
  onStatusChange: (value: RiwayatStatusFilter) => void;
  consultationStatusFilter: ConsultationStatusFilter;
  onConsultationStatusChange: (value: ConsultationStatusFilter) => void;
  kindFilter: HandlingKindFilter;
  onKindChange: (value: HandlingKindFilter) => void;
  doctorId: string;
  onDoctorChange: (value: string) => void;
  doctors: Doctor[];
  onReset: () => void;
  hasActiveFilters: boolean;
};

export default function RiwayatFilterPanel({
  activeTab,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  consultationStatusFilter,
  onConsultationStatusChange,
  kindFilter,
  onKindChange,
  doctorId,
  onDoctorChange,
  doctors,
  onReset,
  hasActiveFilters,
}: Props) {
  const isConsultationTab = activeTab === "Konsultasi";
  const showDoctorFilter =
    activeTab !== "Booking Layanan" && doctors.length > 0;
  const searchPlaceholder =
    activeTab === "Penanganan Dokter"
      ? "Cari dokter, pasien, atau layanan..."
      : activeTab === "Booking Layanan"
        ? "Cari nama pasien atau pemilik..."
        : "Cari customer atau dokter...";

  const selectedDoctor = doctors.find((d) => d.id === doctorId);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <Filter size={16} className="text-[#1E6B4F]" />
          Filter & Pencarian
        </div>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E6B4F] hover:text-[#165a3f] transition-colors"
          >
            <RotateCcw size={13} />
            Reset filter
          </button>
        ) : null}
      </div>

      <div className="p-5 space-y-5">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2 block">
            Pencarian
          </label>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9 pr-9 h-10 rounded-xl border-gray-200 bg-gray-50/50 focus-visible:ring-[#1E6B4F]/30"
              autoComplete="off"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Hapus pencarian"
              >
                <X size={14} />
              </button>
            ) : null}
          </div>
        </div>

        {showDoctorFilter ? (
          <div className="max-w-md">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2 block">
              Dokter
            </label>
            <DoctorSearchCombobox
              doctors={doctors}
              value={doctorId}
              onChange={onDoctorChange}
            />
          </div>
        ) : null}

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2 block">
            {isConsultationTab ? "Status konsultasi" : "Status"}
          </label>

          {isConsultationTab ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CONSULTATION_STATUS_FILTER_OPTIONS.map(
                ({ value, label, description, icon: Icon, activeClass }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onConsultationStatusChange(value)}
                    title={description}
                    className={cn(
                      "flex flex-col items-start gap-1.5 p-3 rounded-xl text-left border transition-all",
                      consultationStatusFilter === value
                        ? `${activeClass} shadow-sm`
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <Icon size={15} className="shrink-0" />
                    <span className="text-xs font-semibold leading-tight">
                      {label}
                    </span>
                  </button>
                )
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {BOOKING_STATUS_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onStatusChange(value)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors",
                    statusFilter === value
                      ? "bg-[#1E6B4F] text-white border-[#1E6B4F] shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                  )}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {activeTab === "Penanganan Dokter" ? (
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2 block">
              Jenis penanganan
            </label>
            <div className="flex flex-wrap gap-2">
              {KIND_OPTIONS.map(({ value, label, icon: Icon, activeClass }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onKindChange(value)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors",
                    kindFilter === value
                      ? activeClass
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {hasActiveFilters ? (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100">
            <span className="text-[11px] font-medium text-gray-400 mr-1">
              Filter aktif:
            </span>
            {searchQuery.trim() ? (
              <FilterChip
                label={`"${searchQuery.trim()}"`}
                onRemove={() => onSearchChange("")}
              />
            ) : null}
            {doctorId && selectedDoctor ? (
              <FilterChip
                label={`Dr. ${selectedDoctor.nama}`}
                onRemove={() => onDoctorChange("")}
              />
            ) : null}
            {isConsultationTab &&
            consultationStatusFilter !== defaultConsultationStatus() ? (
              <FilterChip
                label={consultationStatusFilterLabel(consultationStatusFilter)}
                onRemove={() =>
                  onConsultationStatusChange(defaultConsultationStatus())
                }
              />
            ) : null}
            {!isConsultationTab &&
            statusFilter !== defaultBookingStatusForTab(activeTab) ? (
              <FilterChip
                label={statusFilter}
                onRemove={() =>
                  onStatusChange(defaultBookingStatusForTab(activeTab))
                }
              />
            ) : null}
            {activeTab === "Penanganan Dokter" && kindFilter !== "Semua" ? (
              <FilterChip
                label={kindFilter}
                onRemove={() => onKindChange("Semua")}
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function defaultConsultationStatus(): ConsultationStatusFilter {
  return "Semua";
}

export function defaultBookingStatusForTab(
  tab: RiwayatTab
): RiwayatStatusFilter {
  return tab === "Booking Layanan" ? "Selesai" : "Semua";
}

/** @deprecated Gunakan defaultBookingStatusForTab / defaultConsultationStatus */
export function defaultStatusForTab(tab: RiwayatTab): RiwayatStatusFilter {
  return defaultBookingStatusForTab(tab);
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-[#E8F5EE] text-[#1E6B4F] text-[11px] font-semibold">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="p-0.5 rounded-full hover:bg-[#1E6B4F]/10"
        aria-label={`Hapus filter ${label}`}
      >
        <X size={12} />
      </button>
    </span>
  );
}
