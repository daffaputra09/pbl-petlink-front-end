"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  MessageCircle,
  Stethoscope,
} from "lucide-react";
import BookingList from "@/components/booking/BookingList";
import DetailBookingModal from "@/components/booking/DetailBookingModal";
import ScheduleConsultationDetailModal from "@/components/dokter/ScheduleConsultationDetailModal";
import ConsultationHistoryList from "@/components/riwayat/ConsultationHistoryList";
import HandlingHistoryList from "@/components/riwayat/HandlingHistoryList";
import RiwayatFilterPanel, {
  defaultBookingStatusForTab,
  defaultConsultationStatus,
} from "@/components/riwayat/RiwayatFilterPanel";
import type { ConsultationStatusFilter } from "@/lib/riwayat/consultation-status";
import StatCard from "@/components/keuangan/FinanceStatCard";
import {
  KlinikPageLayout,
  KlinikPageAlert,
  KlinikFilterTabs,
  KlinikSectionCard,
} from "@/components/klinik/KlinikPageLayout";
import { useClinicBookings } from "@/hooks/use-clinic-bookings";
import { useClinicConsultationHistory } from "@/hooks/use-clinic-consultation-history";
import { useClinicHandlingHistory } from "@/hooks/use-clinic-handling-history";
import { useClinicDoctors } from "@/hooks/use-clinic-doctors";
import { fetchClinicRiwayatStats } from "@/lib/actions/clinic-history";
import {
  fetchClinicScheduleBookingDetail,
  fetchClinicScheduleConsultationDetail,
} from "@/lib/actions/schedule-detail";
import { notifyError } from "@/lib/ui/notify";
import type { Booking, BookingStatus } from "@/types/booking";
import type { ConsultationHistoryItem } from "@/types/riwayat";
import type {
  HandlingHistoryEntry,
  HandlingKindFilter,
  RiwayatStats,
  RiwayatStatusFilter,
  RiwayatTab,
} from "@/types/riwayat";
import type { ConsultationScheduleDetail } from "@/types/schedule-detail";

const TABS: RiwayatTab[] = [
  "Konsultasi",
  "Booking Layanan",
  "Penanganan Dokter",
];

export default function RiwayatPage() {
  const [activeTab, setActiveTab] = useState<RiwayatTab>("Konsultasi");
  const [statusFilter, setStatusFilter] =
    useState<RiwayatStatusFilter>("Semua");
  const [consultationStatusFilter, setConsultationStatusFilter] =
    useState<ConsultationStatusFilter>("Semua");
  const [kindFilter, setKindFilter] = useState<HandlingKindFilter>("Semua");
  const [doctorId, setDoctorId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<RiwayatStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedConsultation, setSelectedConsultation] =
    useState<ConsultationScheduleDetail | null>(null);
  const [modalConsultationLoading, setModalConsultationLoading] =
    useState(false);
  const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null);

  const { doctors } = useClinicDoctors();

  const bookingStatusFilter: BookingStatus | "Semua" =
    statusFilter === "Semua"
      ? "Semua"
      : statusFilter === "Selesai"
        ? "Selesai"
        : "Dibatalkan";

  const {
    bookings,
    loading: bookingLoading,
    loadingMore: bookingLoadingMore,
    hasMore: bookingHasMore,
    totalCount: bookingTotal,
    error: bookingError,
    loadMore: loadMoreBookings,
    isSearchMode: bookingSearchMode,
  } = useClinicBookings({
    statusFilter: bookingStatusFilter,
    search: activeTab === "Booking Layanan" ? searchQuery : "",
    listEnabled: activeTab === "Booking Layanan",
  });

  const {
    items: consultations,
    loading: consultationLoading,
    loadingMore: consultationLoadingMore,
    hasMore: consultationHasMore,
    total: consultationTotal,
    error: consultationError,
    loadMore: loadMoreConsultations,
    isSearchMode: consultationSearchMode,
  } = useClinicConsultationHistory({
    statusFilter: consultationStatusFilter,
    doctorId: doctorId || null,
    search: activeTab === "Konsultasi" ? searchQuery : "",
  });

  const {
    items: handlingItems,
    loading: handlingLoading,
    total: handlingTotal,
    hasMore: handlingHasMore,
    loadMore: loadMoreHandling,
    error: handlingError,
    isSearchMode: handlingSearchMode,
  } = useClinicHandlingHistory({
    statusFilter,
    kindFilter,
    doctorId: doctorId || null,
    search: activeTab === "Penanganan Dokter" ? searchQuery : "",
  });

  useEffect(() => {
    let cancelled = false;
    setStatsLoading(true);
    void fetchClinicRiwayatStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {
        if (!cancelled) setStats(null);
      })
      .finally(() => {
        if (!cancelled) setStatsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const listDescription = useMemo(() => {
    if (activeTab === "Konsultasi") {
      if (consultationLoading) return "Memuat riwayat konsultasi...";
      if (consultationSearchMode) {
        return `${consultations.length} hasil pencarian`;
      }
      return `${consultations.length} dari ${consultationTotal} konsultasi`;
    }
    if (activeTab === "Booking Layanan") {
      if (bookingLoading) return "Memuat riwayat booking...";
      if (bookingSearchMode) {
        return `${bookings.length} hasil pencarian`;
      }
      return `${bookings.length} dari ${bookingTotal} booking`;
    }
    if (handlingLoading) return "Memuat riwayat penanganan...";
    if (handlingSearchMode) {
      return `${handlingItems.length} hasil pencarian`;
    }
    return `${handlingItems.length} dari ${handlingTotal} penanganan dokter`;
  }, [
    activeTab,
    consultationLoading,
    consultationSearchMode,
    consultations.length,
    consultationTotal,
    bookingLoading,
    bookingSearchMode,
    bookings.length,
    bookingTotal,
    handlingLoading,
    handlingSearchMode,
    handlingItems.length,
    handlingTotal,
  ]);

  const activeError =
    activeTab === "Konsultasi"
      ? consultationError
      : activeTab === "Booking Layanan"
        ? bookingError
        : handlingError;

  const hasActiveFilters = useMemo(() => {
    if (searchQuery.trim()) return true;
    if (doctorId) return true;
    if (activeTab === "Konsultasi") {
      if (consultationStatusFilter !== defaultConsultationStatus()) return true;
    } else {
      if (statusFilter !== defaultBookingStatusForTab(activeTab)) return true;
    }
    if (activeTab === "Penanganan Dokter" && kindFilter !== "Semua") {
      return true;
    }
    return false;
  }, [
    activeTab,
    searchQuery,
    doctorId,
    statusFilter,
    consultationStatusFilter,
    kindFilter,
  ]);

  function resetFilters() {
    setSearchQuery("");
    setDoctorId("");
    setConsultationStatusFilter(defaultConsultationStatus());
    setStatusFilter(defaultBookingStatusForTab(activeTab));
    setKindFilter("Semua");
  }

  async function openConsultationDetail(item: ConsultationHistoryItem) {
    setDetailLoadingId(item.id);
    setSelectedConsultation(null);
    setModalConsultationLoading(true);
    try {
      const detail = await fetchClinicScheduleConsultationDetail(item.id);
      setSelectedConsultation(detail);
    } catch (e) {
      notifyError(
        e instanceof Error ? e.message : "Gagal memuat detail konsultasi"
      );
    } finally {
      setModalConsultationLoading(false);
      setDetailLoadingId(null);
    }
  }

  async function openHandlingDetail(entry: HandlingHistoryEntry) {
    setDetailLoadingId(entry.id);
    try {
      if (entry.kind === "booking" && entry.bookingId) {
        const booking = await fetchClinicScheduleBookingDetail(entry.bookingId);
        setSelectedBooking(booking);
        return;
      }
      if (entry.kind === "consultation" && entry.consultationId) {
        setModalConsultationLoading(true);
        setSelectedConsultation(null);
        const detail = await fetchClinicScheduleConsultationDetail(
          entry.consultationId
        );
        setSelectedConsultation(detail);
        setModalConsultationLoading(false);
      }
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "Gagal memuat detail");
    } finally {
      setDetailLoadingId(null);
    }
  }

  function handleTabChange(tab: RiwayatTab) {
    setActiveTab(tab);
    setSearchQuery("");
    setDoctorId("");
    setConsultationStatusFilter(defaultConsultationStatus());
    setStatusFilter(defaultBookingStatusForTab(tab));
    if (tab === "Penanganan Dokter") {
      setKindFilter("Semua");
    }
  }

  return (
    <KlinikPageLayout
      title="Riwayat"
      description="Arsip konsultasi, booking layanan, dan penanganan dokter klinik"
      maxWidth="6xl"
    >
      {activeError ? <KlinikPageAlert message={activeError} /> : null}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Konsultasi"
          value={
            statsLoading ? "—" : String(stats?.consultationTotal ?? 0)
          }
          icon={<MessageCircle size={18} />}
          highlight
        />
        <StatCard
          label="Konsultasi Selesai"
          value={
            statsLoading ? "—" : String(stats?.consultationCompleted ?? 0)
          }
          icon={<CheckCircle2 size={18} />}
        />
        <StatCard
          label="Booking Selesai"
          value={statsLoading ? "—" : String(stats?.bookingCompleted ?? 0)}
          icon={<CalendarDays size={18} />}
        />
        <StatCard
          label="Penanganan Dokter"
          value={statsLoading ? "—" : String(stats?.handlingTotal ?? 0)}
          icon={<Stethoscope size={18} />}
        />
      </div>

      <KlinikFilterTabs
        tabs={TABS}
        active={activeTab}
        onChange={handleTabChange}
      />

      <RiwayatFilterPanel
        activeTab={activeTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        consultationStatusFilter={consultationStatusFilter}
        onConsultationStatusChange={setConsultationStatusFilter}
        kindFilter={kindFilter}
        onKindChange={setKindFilter}
        doctorId={doctorId}
        onDoctorChange={setDoctorId}
        doctors={doctors}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <KlinikSectionCard
        title={
          activeTab === "Konsultasi"
            ? "Riwayat Konsultasi"
            : activeTab === "Booking Layanan"
              ? "Riwayat Booking Layanan"
              : "Riwayat Penanganan Dokter"
        }
        description={listDescription}
        actions={
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
            <ClipboardList size={14} />
            Arsip
          </span>
        }
      >
        {activeTab === "Konsultasi" ? (
          <ConsultationHistoryList
            items={consultations}
            loading={consultationLoading}
            loadingMore={consultationLoadingMore}
            hasMore={consultationHasMore && !consultationSearchMode}
            onLoadMore={loadMoreConsultations}
            onSelect={(item) => void openConsultationDetail(item)}
            detailLoadingId={detailLoadingId}
            searchQuery={searchQuery}
          />
        ) : null}

        {activeTab === "Booking Layanan" ? (
          <div className="px-5 pb-5 pt-5">
            <BookingList
              bookings={bookings}
              onSelectBooking={setSelectedBooking}
              loading={bookingLoading}
              loadingMore={bookingLoadingMore}
              hasMore={bookingHasMore && !bookingSearchMode}
              onLoadMore={loadMoreBookings}
              searchQuery={searchQuery}
            />
          </div>
        ) : null}

        {activeTab === "Penanganan Dokter" ? (
          <HandlingHistoryList
            items={handlingItems}
            loading={handlingLoading}
            hasMore={handlingHasMore}
            onLoadMore={loadMoreHandling}
            onSelect={(entry) => void openHandlingDetail(entry)}
            detailLoadingId={detailLoadingId}
            searchQuery={searchQuery}
          />
        ) : null}
      </KlinikSectionCard>

      {selectedBooking ? (
        <DetailBookingModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdateStatus={() => {}}
          onReschedule={() => {}}
          onCancel={() => {}}
        />
      ) : null}

      {(selectedConsultation || modalConsultationLoading) && (
        <ScheduleConsultationDetailModal
          detail={selectedConsultation}
          loading={modalConsultationLoading}
          onClose={() => {
            setSelectedConsultation(null);
            setModalConsultationLoading(false);
          }}
        />
      )}
    </KlinikPageLayout>
  );
}
