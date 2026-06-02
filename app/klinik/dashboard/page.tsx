"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useClinicSession } from "@/lib/auth/clinic-session";
import Link from "next/link";

export default function DashboardPage() {
  const { profile } = useClinicSession();
  const [stats, setStats] = useState({
    bookingToday: 0,
    bookingWeek: 0,
    balance: 0,
    rating: 0,
    reviews: 0,
  });

  useEffect(() => {
    if (!profile) return;
    const supabase = createClient();

    async function load() {
      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: bookings } = await supabase
        .from("bookings")
        .select("scheduled_start_at")
        .eq("clinic_id", profile!.id);

      const list = bookings ?? [];
      const bookingToday = list.filter((b) => {
        const t = new Date(b.scheduled_start_at);
        return t >= startOfDay && t < endOfDay;
      }).length;
      const bookingWeek = list.filter((b) => {
        const t = new Date(b.scheduled_start_at);
        return t >= weekAgo;
      }).length;

      const { data: clinic } = await supabase
        .from("clinic_profiles")
        .select("balance, average_rating, total_reviews")
        .eq("id", profile!.id)
        .single();

      setStats({
        bookingToday,
        bookingWeek,
        balance: Number(clinic?.balance ?? 0),
        rating: Number(clinic?.average_rating ?? 0),
        reviews: clinic?.total_reviews ?? 0,
      });
    }

    load();
  }, [profile]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">
        Dashboard Klinik
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Selamat datang, {profile?.name ?? "Klinik"}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-xs text-gray-400 uppercase">Booking hari ini</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">
            {stats.bookingToday}
          </p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-xs text-gray-400 uppercase">7 hari terakhir</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">
            {stats.bookingWeek}
          </p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-xs text-gray-400 uppercase">Saldo</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            Rp {stats.balance.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-xs text-gray-400 uppercase">Rating</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">
            {stats.rating.toFixed(1)}
          </p>
          <p className="text-xs text-gray-400">{stats.reviews} ulasan</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/klinik/booking"
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium"
        >
          Kelola Booking
        </Link>
        <Link
          href="/klinik/layanan"
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm"
        >
          Layanan
        </Link>
        <Link
          href="/klinik/dokter"
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm"
        >
          Dokter
        </Link>
      </div>
    </div>
  );
}
