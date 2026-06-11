export type DoctorStatus = "Aktif" | "Nonaktif";

/** Selaras dengan `doctor_profiles` + `profiles` (+ email dari auth). */
export interface Doctor {
  id: string;
  nama: string;
  email: string;
  spesialisasi: string;
  bio: string | null;
  licenseNumber: string | null;
  consultationFee: number;
  isActive: boolean;
  status: DoctorStatus;
  photo?: string;
  /** True when doctor has not completed invite password setup yet. */
  awaitingPasswordSetup?: boolean;
}

export interface DoctorFormInput {
  nama: string;
  email: string;
  spesialisasi: string;
  bio?: string;
  licenseNumber?: string;
  consultationFee: number;
  isActive: boolean;
  photoFile?: File | null;
}

export type DoctorScheduleKind =
  | "booking"
  | "consultation"
  | "time_off"
  | "unknown";

/** Baris `doctor_schedules` — booking, konsultasi, atau blok libur. */
export interface DoctorScheduleEntry {
  id: string;
  doctorId: string;
  startsAt: string;
  endsAt: string;
  notes: string | null;
  bookingId: string | null;
  consultationId: string | null;
  kind: DoctorScheduleKind;
  referenceStatus: string | null;
  /** Judul utama kartu (nama customer / pasien). */
  referenceTitle: string;
  /** Baris sekunder (channel, mode, dll.). */
  referenceSubtitle: string | null;
  /** @deprecated Gunakan referenceTitle / referenceSubtitle */
  referenceLabel: string;
}

/** @deprecated Gunakan DoctorScheduleEntry */
export type DoctorBookedSchedule = DoctorScheduleEntry;
