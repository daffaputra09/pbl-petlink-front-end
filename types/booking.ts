export type BookingStatus = "Terjadwal" | "Selesai" | "Dibatalkan";

export type JenisKelamin = "Jantan" | "Betina";

export type Booking = {
  id: string;
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
};
