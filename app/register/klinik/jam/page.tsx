"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import {
  defaultOperatingHours,
  loadRegisterDraft,
  saveRegisterDraft,
  type ClinicDayHours,
  validateOperatingHours,
} from "@/lib/auth/register-draft";

const DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export default function RegisterJamPage() {
  const router = useRouter();
  const [days, setDays] = useState<ClinicDayHours[]>(defaultOperatingHours());
  const [error, setError] = useState("");

  useEffect(() => {
    const draft = loadRegisterDraft();
    if (!draft.clinicName) {
      router.replace("/register/klinik");
    } else if (draft.operatingHours?.length) {
      setDays(draft.operatingHours);
    }
  }, [router]);

  function updateDay(index: number, patch: Partial<ClinicDayHours>) {
    setDays((prev) =>
      prev.map((d, i) => (i === index ? { ...d, ...patch } : d))
    );
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    const err = validateOperatingHours(days);
    if (err) {
      setError(err);
      return;
    }
    saveRegisterDraft({ operatingHours: days });
    router.push("/register/klinik/bank");
  }

  return (
    <AuthShell
      title="Jam operasional"
      subtitle="Atur jadwal buka klinik per hari"
      step={3}
      totalSteps={4}
    >
      <form onSubmit={handleNext} className="space-y-3">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2.5">
            {error}
          </p>
        )}
        {days.map((day, i) => (
          <div
            key={day.dayOfWeek}
            className="flex flex-wrap items-center gap-2 sm:gap-3 border border-gray-100 rounded-xl p-3 bg-gray-50/50"
          >
            <span className="w-10 text-sm font-semibold text-gray-700">
              {DAY_LABELS[i]}
            </span>
            <label className="flex items-center gap-1.5 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={day.isClosed}
                onChange={(e) =>
                  updateDay(i, { isClosed: e.target.checked })
                }
                className="rounded border-gray-300 text-emerald-600"
              />
              Tutup
            </label>
            {!day.isClosed && (
              <>
                <input
                  type="time"
                  value={day.openTime}
                  onChange={(e) => updateDay(i, { openTime: e.target.value })}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                />
                <span className="text-gray-400 text-sm">—</span>
                <input
                  type="time"
                  value={day.closeTime}
                  onChange={(e) => updateDay(i, { closeTime: e.target.value })}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                />
              </>
            )}
          </div>
        ))}
        <button
          type="submit"
          className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition mt-4"
        >
          Lanjut
        </button>
      </form>
    </AuthShell>
  );
}
