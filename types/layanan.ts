/** Selaras dengan tabel `services` (Supabase). */
export interface ClinicService {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durationMinutes: number;
  isActive: boolean;
  isClinicService: boolean;
  isHomeService: boolean;
}

export interface ServiceFormInput {
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
  isClinicService: boolean;
  isHomeService: boolean;
  isActive: boolean;
}

export interface ServiceStatItem {
  label: string;
  value: string;
  badge: string;
  badgeClass: string;
  iconKey: "total" | "price" | "duration";
}
