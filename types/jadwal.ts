export type HariKerja =
  | "Senin"
  | "Selasa"
  | "Rabu"
  | "Kamis"
  | "Jumat"
  | "Sabtu"
  | "Minggu";

export type StatusJadwal = "Aktif" | "Libur" | "Pengganti";

export interface JadwalDokter {
  id: string;
  doctorId: string;
  hari: HariKerja;
  jamMulai: string; // format "HH:mm"
  jamSelesai: string; // format "HH:mm"
  ruangan: string;
  kuotaPasien: number;
  terdaftar: number;
  status: StatusJadwal;
}
