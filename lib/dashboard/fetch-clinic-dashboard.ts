import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveBookingDisplayStatus } from "@/lib/booking/display-status";
import { fetchCustomerNamesById } from "@/lib/booking/fetch-customer-names";
import type {
  ClinicDashboardData,
  DashboardRecentBooking,
  DashboardStatusSlice,
  DashboardWeeklyPoint,
} from "@/types/dashboard";

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function first<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

function buildWeekRanges(now: Date) {
  const points: { label: string; start: Date; end: Date }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const end = new Date(d);
    end.setDate(end.getDate() + 1);
    points.push({ label: DAY_LABELS[d.getDay()], start: d, end });
  }
  return points;
}

function statusBucket(raw: string): "Terjadwal" | "Selesai" | "Dibatalkan" {
  if (raw === "completed") return "Selesai";
  if (raw === "cancelled") return "Dibatalkan";
  return "Terjadwal";
}

const STATUS_COLORS: Record<string, string> = {
  Terjadwal: "#1E6B4F",
  Selesai: "#4CAF82",
  Dibatalkan: "#EF5350",
};

export async function fetchClinicDashboard(
  supabase: SupabaseClient,
  clinicId: string
): Promise<ClinicDashboardData> {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekRanges = buildWeekRanges(now);
  const weekStart = weekRanges[0].start;

  const [
    clinicRes,
    bookingsRes,
    paymentsRes,
    pendingWithdrawRes,
    doctorsRes,
    servicesRes,
    recentRes,
  ] = await Promise.all([
    supabase
      .from("clinic_profiles")
      .select("balance, average_rating, total_reviews")
      .eq("id", clinicId)
      .single(),
    supabase
      .from("bookings")
      .select("id, status, scheduled_start_at, channel")
      .eq("clinic_id", clinicId)
      .gte("scheduled_start_at", weekStart.toISOString()),
    supabase
      .from("payments")
      .select("amount, status, paid_at, created_at")
      .eq("clinic_id", clinicId)
      .eq("status", "paid")
      .gte("paid_at", weekStart.toISOString()),
    supabase
      .from("withdraw_requests")
      .select("id", { count: "exact", head: true })
      .eq("clinic_id", clinicId)
      .eq("status", "pending"),
    supabase
      .from("doctor_profiles")
      .select("id", { count: "exact", head: true })
      .eq("clinic_id", clinicId)
      .eq("is_active", true),
    supabase
      .from("services")
      .select("id", { count: "exact", head: true })
      .eq("clinic_id", clinicId)
      .eq("is_active", true),
    supabase
      .from("bookings")
      .select(
        `
        id, status, scheduled_start_at, scheduled_end_at, channel, customer_id,
        customer_pets ( name )
      `
      )
      .eq("clinic_id", clinicId)
      .gte("scheduled_start_at", now.toISOString())
      .in("status", ["pending", "confirmed", "in_progress"])
      .order("scheduled_start_at", { ascending: true })
      .limit(5),
  ]);

  if (clinicRes.error) throw clinicRes.error;

  const bookings = bookingsRes.data ?? [];
  const payments = paymentsRes.data ?? [];

  const allBookingsForStatus = await supabase
    .from("bookings")
    .select("status")
    .eq("clinic_id", clinicId);

  if (allBookingsForStatus.error) throw allBookingsForStatus.error;

  const statusCounts: Record<string, number> = {
    Terjadwal: 0,
    Selesai: 0,
    Dibatalkan: 0,
  };
  for (const row of allBookingsForStatus.data ?? []) {
    const bucket = statusBucket(row.status as string);
    statusCounts[bucket] += 1;
  }

  const statusBreakdown: DashboardStatusSlice[] = Object.entries(statusCounts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name] ?? "#94A3B8",
    }));

  const weekly: DashboardWeeklyPoint[] = weekRanges.map(({ label, start, end }) => {
    const booking = bookings.filter((b) => {
      const t = new Date(b.scheduled_start_at as string);
      return t >= start && t < end;
    }).length;

    const pendapatan = payments
      .filter((p) => {
        const t = new Date((p.paid_at as string) ?? (p.created_at as string));
        return t >= start && t < end;
      })
      .reduce((s, p) => s + Number(p.amount), 0);

    return { label, pendapatan, booking };
  });

  const bookingToday = bookings.filter((b) => {
    const t = new Date(b.scheduled_start_at as string);
    return t >= startOfDay && t < endOfDay;
  }).length;

  const revenueToday = payments
    .filter((p) => {
      const t = new Date((p.paid_at as string) ?? (p.created_at as string));
      return t >= startOfDay && t < endOfDay;
    })
    .reduce((s, p) => s + Number(p.amount), 0);

  const monthPayments = await supabase
    .from("payments")
    .select("amount, paid_at, created_at")
    .eq("clinic_id", clinicId)
    .eq("status", "paid");

  if (monthPayments.error) throw monthPayments.error;

  const revenueMonth = (monthPayments.data ?? [])
    .filter((p) => {
      const t = new Date((p.paid_at as string) ?? (p.created_at as string));
      return t >= startOfMonth;
    })
    .reduce((s, p) => s + Number(p.amount), 0);

  const upcomingRes = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("clinic_id", clinicId)
    .gte("scheduled_start_at", now.toISOString())
    .in("status", ["pending", "confirmed", "in_progress"]);

  const recentRows = recentRes.data ?? [];
  const customerIds = recentRows.map((r) => r.customer_id as string);
  const nameByCustomer = await fetchCustomerNamesById(supabase, customerIds);

  const recentBookings: DashboardRecentBooking[] = recentRows.map((row) => {
    const pet = first(
      row.customer_pets as { name?: string } | { name?: string }[] | null
    );
    const scheduledAt = row.scheduled_start_at as string;
    const scheduledEndAt = row.scheduled_end_at as string;
    const display = resolveBookingDisplayStatus({
      bookingStatus: row.status as string,
      channel: row.channel as string | null,
      scheduledStartAt: new Date(scheduledAt),
      scheduledEndAt: new Date(scheduledEndAt ?? scheduledAt),
    });
    return {
      id: row.id as string,
      patientName: pet?.name ?? "Pasien",
      ownerName: nameByCustomer[row.customer_id as string] ?? "Customer",
      scheduledAt,
      statusLabel: display.label,
      displayKind: display.kind,
      channel: (row.channel as string | null) ?? null,
    };
  });

  const clinic = clinicRes.data;

  return {
    stats: {
      bookingToday,
      bookingUpcoming: upcomingRes.count ?? 0,
      balance: Number(clinic?.balance ?? 0),
      revenueToday,
      revenueMonth,
      rating: Number(clinic?.average_rating ?? 0),
      reviewCount: clinic?.total_reviews ?? 0,
      pendingWithdrawals: pendingWithdrawRes.count ?? 0,
      activeDoctors: doctorsRes.count ?? 0,
      activeServices: servicesRes.count ?? 0,
    },
    weekly,
    statusBreakdown,
    recentBookings,
  };
}
