import type { Booking, BookingStatus, JenisKelamin } from "@/types/booking";
import {
  formatDateYmdInAppTz,
  formatTimeInAppTz,
} from "@/lib/datetime/indonesia";
import { resolveBookingDisplayStatus } from "./display-status";
import { customerNotesFromNotes, visitAddressFromNotes } from "./notes";

type PetRow = {
  name: string;
  breed: string | null;
  sex: string;
  birth_month: number;
  birth_year: number;
  pet_types: { name: string } | { name: string }[] | null;
};

type DoctorProfileJoin = {
  profiles: { name: string } | { name: string }[] | null;
};

type BookingRow = {
  id: string;
  status: string;
  scheduled_start_at: string;
  scheduled_end_at: string;
  created_at?: string;
  channel?: string | null;
  total_amount?: number | null;
  notes?: string | null;
  visit_latitude?: number | null;
  visit_longitude?: number | null;
  checked_in_at?: string | null;
  doctor_id?: string | null;
  customer_pets: PetRow | PetRow[] | null;
  customer_profiles?:
    | { address: string | null }
    | { address: string | null }[]
    | null;
  doctor_profiles?: DoctorProfileJoin | DoctorProfileJoin[] | null;
  booking_items?: {
    quantity: number | null;
    unit_price: number | null;
    line_total: number | null;
    duration_minutes: number | null;
    services: { name: string } | { name: string }[] | null;
  }[] | null;
};

function first<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

function toNumber(v: unknown): number {
  if (typeof v === "number") return v;
  return Number.parseFloat(String(v ?? 0)) || 0;
}

function petAge(birthMonth: number, birthYear: number): string {
  const now = new Date();
  let years = now.getFullYear() - birthYear;
  const months = now.getMonth() + 1 - birthMonth;
  if (months < 0) years -= 1;
  if (years < 1) return "< 1 Tahun";
  return `${years} Tahun`;
}

function mapSex(sex: string): JenisKelamin {
  return sex === "female" ? "Betina" : "Jantan";
}

function scheduleDurationMinutes(startIso: string, endIso: string): number {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  return Math.max(0, Math.round(ms / 60_000));
}

export function mapBookingRow(
  row: BookingRow,
  options?: {
    ownerName?: string | null;
    ownerEmail?: string | null;
    ownerPhone?: string | null;
    paymentStatus?: string | null;
    paymentAmount?: number | null;
    paidAt?: string | null;
    paymentMethod?: string | null;
    midtransOrderId?: string | null;
  }
): Booking {
  const pet = first(row.customer_pets);
  const customer = first(row.customer_profiles);
  const petType = pet ? first(pet.pet_types) : null;
  const doctorJoin = first(row.doctor_profiles);
  const doctorProfile = first(doctorJoin?.profiles ?? null);
  const namaDokter = doctorProfile?.name ?? null;

  const display = resolveBookingDisplayStatus({
    bookingStatus: row.status,
    channel: row.channel,
    paymentStatus: options?.paymentStatus,
    scheduledStartAt: new Date(row.scheduled_start_at),
    scheduledEndAt: new Date(row.scheduled_end_at),
  });

  const uiStatus: BookingStatus = display.filterStatus;
  const visitAddress = visitAddressFromNotes(row.notes);
  const catatanCustomer = customerNotesFromNotes(row.notes);

  const bookingItems = Array.isArray(row.booking_items) ? row.booking_items : [];

  const layanan = bookingItems
    .map((bi) => {
      const name = first(bi?.services ?? null)?.name;
      if (!name) return null;
      return {
        name,
        quantity: bi.quantity ?? 1,
        unitPrice: toNumber(bi.unit_price),
        lineTotal: toNumber(bi.line_total),
        durationMinutes: bi.duration_minutes ?? 0,
      };
    })
    .filter(Boolean) as Booking["layanan"];

  const namaLayanan = layanan?.map((l) => l.name) ?? [];

  const itemsTotal = layanan?.reduce((sum, item) => sum + item.lineTotal, 0) ?? 0;
  const dbTotal = toNumber(row.total_amount);
  const totalAmount = dbTotal > 0 ? dbTotal : itemsTotal;

  const serviceDuration = layanan?.reduce(
    (sum, item) => sum + item.durationMinutes * item.quantity,
    0
  );
  const durationMinutes =
    serviceDuration && serviceDuration > 0
      ? serviceDuration
      : scheduleDurationMinutes(row.scheduled_start_at, row.scheduled_end_at);

  return {
    id: row.id,
    namaPasien: pet?.name ?? "-",
    jenis: pet?.breed ?? "-",
    kategori: petType?.name ?? "-",
    usia: pet ? petAge(pet.birth_month, pet.birth_year) : "-",
    jenisKelamin: pet ? mapSex(pet.sex) : "Jantan",
    namaPemilik: options?.ownerName ?? "-",
    alamatPemilik: customer?.address ?? "-",
    emailPemilik: options?.ownerEmail ?? "-",
    telpPemilik: options?.ownerPhone ?? "-",
    jamMulai: formatTimeInAppTz(row.scheduled_start_at),
    jamSelesai: formatTimeInAppTz(row.scheduled_end_at),
    tanggal: formatDateYmdInAppTz(row.scheduled_start_at),
    status: uiStatus,
    rawStatus: row.status,
    paymentStatus: options?.paymentStatus ?? null,
    paymentAmount: options?.paymentAmount ?? totalAmount,
    paidAt: options?.paidAt ?? null,
    paymentMethod: options?.paymentMethod ?? null,
    midtransOrderId: options?.midtransOrderId ?? null,
    scheduledStartAt: row.scheduled_start_at,
    scheduledEndAt: row.scheduled_end_at,
    createdAt: row.created_at,
    channel: row.channel ?? null,
    displayLabel: display.label,
    displayKind: display.kind,
    visitAddress,
    visitLatitude: row.visit_latitude ?? null,
    visitLongitude: row.visit_longitude ?? null,
    checkedInAt: row.checked_in_at ?? null,
    durationMinutes,
    totalAmount,
    catatan: row.notes ?? null,
    catatanCustomer,
    doctorId: row.doctor_id ?? null,
    namaDokter,
    namaLayanan,
    layanan,
  };
}

export const BOOKING_LIST_SELECT = `
  id, status, scheduled_start_at, scheduled_end_at, created_at,
  channel, total_amount, notes,
  visit_latitude, visit_longitude, checked_in_at, customer_id, pet_id, doctor_id,
  customer_pets (
    name, breed, sex, birth_month, birth_year,
    pet_types ( name )
  ),
  customer_profiles (
    address
  ),
  doctor_profiles (
    profiles ( name )
  ),
  booking_items (
    quantity, line_total, unit_price, duration_minutes,
    services ( name )
  )
`;
