export type UserRole = "customer" | "clinic" | "doctor" | "admin";

export interface ClinicProfile {
  id: string;
  name: string;
  imageUrl: string | null;
  role: UserRole;
}
