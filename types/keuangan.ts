export type StatusPenarikan = "Berhasil" | "Diproses" | "Gagal";

export interface HistoryPenarikan {
  id: string;
  tanggal: string;
  waktu: string;
  jumlah: number;
  namaBank: string;
  nomorRekening: string;
  atasNama: string;
  status: StatusPenarikan;
}

export interface DataGrafik {
  label: string; // "Sen", "Sel", "Rab" etc
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
