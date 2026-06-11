export type StatusPenarikan = "Menunggu" | "Berhasil" | "Ditolak";

/** Nilai kolom `withdraw_requests.status` di Supabase. */
export type WithdrawDbStatus =
  | "pending"
  | "approved"
  | "completed"
  | "rejected";

export interface HistoryPenarikan {
  id: string;
  tanggal: string;
  waktu: string;
  jumlah: number;
  namaBank: string;
  nomorRekening: string;
  atasNama: string;
  status: StatusPenarikan;
  /** Status mentah dari database — untuk filter & logika. */
  rawStatus: WithdrawDbStatus;
  rejectionReason?: string | null;
  transferProofUrl?: string | null;
  createdAt?: string;
}

export interface DataGrafik {
  label: string;
  pendapatan: number;
}

export interface KeuanganData {
  saldoTersedia: number;
  pendapatanHariIni: number;
  pendapatanBulanIni: number;
  totalPenarikan: number;
  grafikMingguan: DataGrafik[];
  historyPenarikan: HistoryPenarikan[];
}

export interface FormPenarikan {
  jumlah: string;
  namaBank: string;
  nomorRekening: string;
  atasNama: string;
}

export interface Pendapatan {
  id: string;
  created_at: string;
  pasien_nama: string;
  layanan: string;
  nominal: number;
  gross_amount?: number;
  platform_fee?: number;
  metode_pembayaran: string;
  reference_type?: "booking" | "consultation";
  reference_id?: string;
}