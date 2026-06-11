export type BookingStatus = "Terjadwal" | "Selesai" | "Dibatalkan";

export type JenisKelamin = "Jantan" | "Betina";

export type BookingDisplayKind =
  | "belumDibayar"
  | "pembayaranGagal"
  | "terjadwal"
  | "dikonfirmasi"
  | "menungguCheckIn"
  | "berlangsung"
  | "selesai"
  | "dibatalkan";

export interface BookingServiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  durationMinutes: number;
}

export type Booking = {
  id: string;
  /** DB fields for mutations */
  rawStatus?: string;
  paymentStatus?: string | null;
  paymentAmount?: number | null;
  paidAt?: string | null;
  paymentMethod?: string | null;
  midtransOrderId?: string | null;
  scheduledStartAt?: string;
  scheduledEndAt?: string;
  createdAt?: string;
  customerId?: string;
  /** Label status detail (selaras petlink). */
  displayLabel?: string;
  displayKind?: BookingDisplayKind;
  visitAddress?: string | null;
  visitLatitude?: number | null;
  visitLongitude?: number | null;
  checkedInAt?: string | null;
  durationMinutes?: number;
  // Pasien
  namaPasien: string;
  jenis: string;
  kategori: string;
  usia: string;
  jenisKelamin: JenisKelamin;
  // Pemilik
  namaPemilik: string;
  alamatPemilik: string;
  emailPemilik: string;
  telpPemilik: string;
  // Jadwal
  jamMulai: string;
  jamSelesai: string;
  tanggal: string;
  // Status
  status: BookingStatus;
  // Dokter & layanan
  doctorId?: string | null;
  namaDokter?: string | null;
  namaLayanan?: string[] | null;
  layanan?: BookingServiceItem[];
  totalAmount?: number | null;
  catatan?: string | null;
  /** Catatan customer tanpa baris alamat kunjungan. */
  catatanCustomer?: string | null;
  channel?: string | null;
};
