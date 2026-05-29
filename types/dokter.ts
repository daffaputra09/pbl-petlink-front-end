export type DoctorStatus = "Bertugas" | "Cuti" | "Operasi";

export interface Doctor {
  id: string;
  nama: string;
  email: string;
  phone: string;
  spesialisasi: string[];
  status: DoctorStatus;
  photo?: string;
  jadwal: string[];
  biografi?: string;
}