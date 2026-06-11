export interface DashboardWeeklyPoint {
  label: string;
  pendapatan: number;
  booking: number;
}

export interface DashboardStatusSlice {
  name: string;
  value: number;
  color: string;
}

export interface DashboardRecentBooking {
  id: string;
  patientName: string;
  ownerName: string;
  scheduledAt: string;
  statusLabel: string;
  channel: string | null;
}

export interface ClinicDashboardStats {
  bookingToday: number;
  bookingUpcoming: number;
  balance: number;
  revenueToday: number;
  revenueMonth: number;
  rating: number;
  reviewCount: number;
  pendingWithdrawals: number;
  activeDoctors: number;
  activeServices: number;
}

export interface ClinicDashboardData {
  stats: ClinicDashboardStats;
  weekly: DashboardWeeklyPoint[];
  statusBreakdown: DashboardStatusSlice[];
  recentBookings: DashboardRecentBooking[];
}
