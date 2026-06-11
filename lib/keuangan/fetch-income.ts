import type { SupabaseClient } from "@supabase/supabase-js";
import { formatPaymentMethod } from "@/lib/keuangan/format";
import type { Pendapatan } from "@/types/keuangan";

type PaymentRow = {
  id: string;
  amount: number | string;
  paid_at: string | null;
  created_at: string;
  reference_type: "booking" | "consultation";
  reference_id: string;
  customer_id: string;
  payment_method: string | null;
  midtrans_payment_type: string | null;
};

function first<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

function toNumber(v: unknown): number {
  if (typeof v === "number") return v;
  return Number.parseFloat(String(v ?? 0)) || 0;
}

async function fetchCustomerNames(
  supabase: SupabaseClient,
  customerIds: string[]
) {
  const unique = Array.from(new Set(customerIds.filter(Boolean)));
  if (unique.length === 0) return {} as Record<string, string>;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, name")
    .in("id", unique);

  if (error) throw error;

  const out: Record<string, string> = {};
  for (const row of data ?? []) {
    out[row.id] = row.name;
  }
  return out;
}

async function fetchBookingServiceLabels(
  supabase: SupabaseClient,
  bookingIds: string[]
) {
  const unique = Array.from(new Set(bookingIds.filter(Boolean)));
  if (unique.length === 0) return {} as Record<string, string>;

  const { data, error } = await supabase
    .from("booking_items")
    .select("booking_id, services(name)")
    .in("booking_id", unique);

  if (error) throw error;

  const grouped = new Map<string, string[]>();
  for (const row of data ?? []) {
    const service = first(row.services as { name: string } | { name: string }[]);
    if (!service?.name) continue;
    const list = grouped.get(row.booking_id) ?? [];
    list.push(service.name);
    grouped.set(row.booking_id, list);
  }

  const out: Record<string, string> = {};
  for (const [bookingId, names] of Array.from(grouped.entries())) {
    const uniqueNames = Array.from(new Set(names));
    out[bookingId] =
      uniqueNames.length <= 2
        ? uniqueNames.join(", ")
        : `${uniqueNames.slice(0, 2).join(", ")} +${uniqueNames.length - 2}`;
  }
  return out;
}

async function fetchConsultationLabels(
  supabase: SupabaseClient,
  consultationIds: string[]
) {
  const unique = Array.from(new Set(consultationIds.filter(Boolean)));
  if (unique.length === 0) return {} as Record<string, string>;

  const { data: consultations, error: consultationError } = await supabase
    .from("consultations")
    .select("id, doctor_id")
    .in("id", unique);

  if (consultationError) {
    console.warn("fetchConsultationLabels:", consultationError.message);
    return Object.fromEntries(unique.map((id) => [id, "Konsultasi Online"]));
  }

  const doctorIds = Array.from(
    new Set((consultations ?? []).map((row) => row.doctor_id).filter(Boolean))
  );

  let doctorNames: Record<string, string> = {};
  if (doctorIds.length > 0) {
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, name")
      .in("id", doctorIds);

    if (profileError) {
      console.warn("fetchConsultationLabels profiles:", profileError.message);
    } else {
      doctorNames = Object.fromEntries(
        (profiles ?? []).map((row) => [row.id, row.name])
      );
    }
  }

  const out: Record<string, string> = {};
  for (const row of consultations ?? []) {
    const doctorName = doctorNames[row.doctor_id];
    out[row.id] = doctorName
      ? `Konsultasi Online · ${doctorName}`
      : "Konsultasi Online";
  }

  for (const id of unique) {
    if (!out[id]) out[id] = "Konsultasi Online";
  }

  return out;
}

function mapPaymentRow(
  row: PaymentRow,
  customerNames: Record<string, string>,
  bookingLabels: Record<string, string>,
  consultationLabels: Record<string, string>
): Pendapatan {
  const paidAt = row.paid_at ?? row.created_at;
  const layanan =
    row.reference_type === "booking"
      ? bookingLabels[row.reference_id] ?? "Booking Layanan"
      : consultationLabels[row.reference_id] ?? "Konsultasi Online";

  return {
    id: row.id,
    created_at: paidAt,
    pasien_nama: customerNames[row.customer_id] ?? "Customer",
    layanan,
    nominal: toNumber(row.amount),
    metode_pembayaran: formatPaymentMethod(
      row.payment_method,
      row.midtrans_payment_type
    ),
    reference_type: row.reference_type,
    reference_id: row.reference_id,
  };
}

export async function fetchClinicIncome(
  supabase: SupabaseClient,
  clinicId: string,
  options: {
    limit?: number;
    offset?: number;
    search?: string;
  } = {}
): Promise<{ items: Pendapatan[]; total: number }> {
  const { limit = 20, offset = 0, search = "" } = options;
  const term = search.trim().toLowerCase();

  let customerFilterIds: string[] | null = null;
  if (term) {
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .ilike("name", `%${term}%`);
    if (profileError) throw profileError;
    customerFilterIds = (profiles ?? []).map((p) => p.id);
    if (customerFilterIds.length === 0) {
      return { items: [], total: 0 };
    }
  }

  let query = supabase
    .from("payments")
    .select(
      "id, amount, paid_at, created_at, reference_type, reference_id, customer_id, payment_method, midtrans_payment_type",
      { count: "exact" }
    )
    .eq("clinic_id", clinicId)
    .eq("status", "paid")
    .order("paid_at", { ascending: false });

  if (customerFilterIds) {
    query = query.in("customer_id", customerFilterIds);
  }

  const { data, count, error } = await query.range(offset, offset + limit - 1);
  if (error) throw error;

  const rows = (data ?? []) as PaymentRow[];
  if (rows.length === 0) {
    return { items: [], total: count ?? 0 };
  }

  const [customerNames, bookingLabels, consultationLabels] = await Promise.all([
    fetchCustomerNames(
      supabase,
      rows.map((row) => row.customer_id)
    ),
    fetchBookingServiceLabels(
      supabase,
      rows
        .filter((row) => row.reference_type === "booking")
        .map((row) => row.reference_id)
    ),
    fetchConsultationLabels(
      supabase,
      rows
        .filter((row) => row.reference_type === "consultation")
        .map((row) => row.reference_id)
    ),
  ]);

  return {
    items: rows.map((row) =>
      mapPaymentRow(row, customerNames, bookingLabels, consultationLabels)
    ),
    total: count ?? rows.length,
  };
}
