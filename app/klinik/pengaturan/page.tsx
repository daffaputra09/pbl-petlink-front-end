"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useClinicSession } from "@/lib/auth/clinic-session";
import { daftarBank } from "@/data/keuangan";
import { bankCodeFor } from "@/lib/auth/register-draft-types";
import {
  defaultOperatingHours,
  operatingHoursToRpcPayload,
  validateOperatingHours,
  type ClinicDayHours,
} from "@/lib/auth/register-draft";

const DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export default function PengaturanPage() {
  const { profile, signOut } = useClinicSession();
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [days, setDays] = useState<ClinicDayHours[]>(defaultOperatingHours());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!profile) return;
    const supabase = createClient();
    supabase
      .from("clinic_profiles")
      .select("description, address, bank_name, account_name, account_number")
      .eq("id", profile.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setDescription(data.description ?? "");
          setAddress(data.address ?? "");
          setBankName(data.bank_name ?? daftarBank[0]);
          setAccountName(data.account_name ?? "");
          setAccountNumber(data.account_number ?? "");
        }
      });
  }, [profile]);

  async function handleSave() {
    if (!profile) return;
    const hoursError = validateOperatingHours(days);
    if (hoursError) {
      setMessage(hoursError);
      return;
    }
    setSaving(true);
    setMessage("");
    const supabase = createClient();

    const { error: clinicError } = await supabase
      .from("clinic_profiles")
      .update({
        description: description.trim(),
        address: address.trim(),
        bank_name: bankName,
        account_name: accountName.trim(),
        account_number: accountNumber.trim(),
        bank_code: bankCodeFor(bankName),
      })
      .eq("id", profile.id);

    if (clinicError) {
      setMessage(clinicError.message);
      setSaving(false);
      return;
    }

    const { error: hoursErrorRpc } = await supabase.rpc(
      "replace_clinic_opening_hours",
      {
        p_clinic_id: profile.id,
        p_days: operatingHoursToRpcPayload(days),
      }
    );

    setSaving(false);
    setMessage(hoursErrorRpc ? hoursErrorRpc.message : "Pengaturan disimpan.");
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-800 mb-6">Pengaturan Klinik</h1>

      <div className="space-y-4 bg-white border rounded-xl p-6">
        <div>
          <label className="text-sm font-medium text-gray-700">Deskripsi</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Alamat</label>
          <textarea
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Bank</label>
          <select
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          >
            {daftarBank.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">
            Nama rekening
          </label>
          <input
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">
            Nomor rekening
          </label>
          <input
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <h2 className="text-sm font-semibold text-gray-700 pt-2">
          Jam operasional
        </h2>
        {days.map((day, i) => (
          <div key={day.dayOfWeek} className="flex flex-wrap items-center gap-2">
            <span className="w-10 text-sm">{DAY_LABELS[i]}</span>
            <label className="text-sm flex items-center gap-1">
              <input
                type="checkbox"
                checked={day.isClosed}
                onChange={(e) =>
                  setDays((prev) =>
                    prev.map((d, j) =>
                      j === i ? { ...d, isClosed: e.target.checked } : d
                    )
                  )
                }
              />
              Tutup
            </label>
            {!day.isClosed && (
              <>
                <input
                  type="time"
                  value={day.openTime}
                  onChange={(e) =>
                    setDays((prev) =>
                      prev.map((d, j) =>
                        j === i ? { ...d, openTime: e.target.value } : d
                      )
                    )
                  }
                  className="border rounded px-2 py-1 text-sm"
                />
                <input
                  type="time"
                  value={day.closeTime}
                  onChange={(e) =>
                    setDays((prev) =>
                      prev.map((d, j) =>
                        j === i ? { ...d, closeTime: e.target.value } : d
                      )
                    )
                  }
                  className="border rounded px-2 py-1 text-sm"
                />
              </>
            )}
          </div>
        ))}

        {message && (
          <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
            {message}
          </p>
        )}

        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="w-full py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-60"
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </button>

        <button
          type="button"
          onClick={() => signOut()}
          className="w-full py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm"
        >
          Keluar
        </button>
      </div>
    </div>
  );
}
