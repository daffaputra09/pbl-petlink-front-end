import type { Booking, BookingStatus, JenisKelamin } from "@/types/booking";
import { resolveBookingDisplayStatus } from "./display-status";

type PetRow = {
  name: string;
  breed: string | null;
  sex: string;
  birth_month: number;
  birth_year: number;
  pet_types: { name: string } | { name: string }[] | null;
};

type BookingRow = {
  id: string;
  status: string;
  scheduled_start_at: string;
  scheduled_end_at: string;
  channel?: string | null;
  total_amount?: number | null;
  notes?: string | null;  
  customer_pets: PetRow | PetRow[] | null;
  customer_profiles?:
    | { address: string | null }
    | { address: string | null }[]
    | null;
  doctor_profiles?: { profiles: { name: string } | null } | null;  
  booking_items?: { services: { name: string } | null;
  unit_price: number | null;
  line_total: number | null;
  }[] | null;
};

function first<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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

export function mapBookingRow(
  row: BookingRow,
  options?: {
    ownerName?: string | null;
    ownerEmail?: string | null;
    ownerPhone?: string | null;
    paymentStatus?: string | null;
  }
): Booking {
  const pet = first(row.customer_pets);
  const customer = first(row.customer_profiles);
  const petType = pet ? first(pet.pet_types) : null;
  const doctorProfile = first(row.doctor_profiles as any)?.profiles;
  const namaDokter = doctorProfile?.name ?? null;

  const display = resolveBookingDisplayStatus({
    bookingStatus: row.status,
    paymentStatus: options?.paymentStatus,
    scheduledStartAt: new Date(row.scheduled_start_at),
    scheduledEndAt: new Date(row.scheduled_end_at),
  });

  const uiStatus: BookingStatus =
    display.label === "Belum dibayar" ||
    display.label === "Berlangsung" ||
    display.label === "Pembayaran gagal"
      ? display.label === "Pembayaran gagal"
        ? "Dibatalkan"
        : "Terjadwal"
      : (display.label as BookingStatus);


  const bookingItems = Array.isArray(row.booking_items) ? row.booking_items : [];

  const namaLayanan = bookingItems
    .map((bi) => bi?.services?.name)
    .filter(Boolean) as string[];

  const totalAmount = bookingItems.reduce(
    (sum, item) => sum + (item.line_total ?? 0),
    0
  );

  return {
    id: row.id,
    namaPasien: pet?.name ?? "-",
    jenis: pet?.breed ?? "-",
    kategori: petType?.name ?? "-",
    usia: pet ? petAge(pet.birth_month, pet.birth_year) : "-",
    beratKg: 0,
    jenisKelamin: pet ? mapSex(pet.sex) : "Jantan",
    namaPemilik: options?.ownerName ?? "-",
    alamatPemilik: customer?.address ?? "-",
    emailPemilik: options?.ownerEmail ?? "-",
    telpPemilik: options?.ownerPhone ?? "-",
    jamMulai: formatTime(row.scheduled_start_at),
    jamSelesai: formatTime(row.scheduled_end_at),
    tanggal: formatDate(row.scheduled_start_at),
    status: uiStatus,
    rawStatus: row.status,
    paymentStatus: options?.paymentStatus ?? null,
    scheduledStartAt: row.scheduled_start_at,
    scheduledEndAt: row.scheduled_end_at,
    channel: row.channel ?? null,
    totalAmount,
    catatan: row.notes ?? null,
    namaDokter: namaDokter,
    namaLayanan: namaLayanan,
  };
}

/** Aligns with petlink customer_booking_service — payments fetched separately. */
export const BOOKING_LIST_SELECT = `
  id, status, scheduled_start_at, scheduled_end_at, channel, total_amount, notes, customer_id, pet_id,
  
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
    line_total,
    unit_price,
    services ( name )
  )
`;
