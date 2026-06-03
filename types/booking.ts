export type BookingStatus = "Terjadwal" | "Selesai" | "Dibatalkan";

export type JenisKelamin = "Jantan" | "Betina";

export type Booking = {
  id: string;
  /** DB fields for mutations (optional on UI-only rows) */
  rawStatus?: string;
  paymentStatus?: string | null;
  scheduledStartAt?: string;
  scheduledEndAt?: string;
  customerId?: string;
  // Pasien
  namaPasien: string;
  jenis: string;        // breed / ras
  kategori: string;     // e.g. "Kucing", "Anjing", "Kelinci"
  usia: string;
  beratKg: number;
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
  //Dokter
  namaDokter?: string | null;
  namaLayanan?: string[] | null;
  totalAmount?: number | null;
  catatan?: string | null;
  channel?: string | null;
};
