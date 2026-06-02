"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthTextField } from "@/components/auth/AuthTextField";
import {
  ClinicMapPicker,
  type MapLocation,
} from "@/components/auth/ClinicMapPicker";
import { ProfilePhotoPicker } from "@/components/auth/ProfilePhotoPicker";
import {
  clearRegisterPhoto,
  loadRegisterDraft,
  saveRegisterDraft,
  saveRegisterPhoto,
} from "@/lib/auth/register-draft";

export default function RegisterKlinikPage() {
  const router = useRouter();
  const [clinicName, setClinicName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<MapLocation | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const draft = loadRegisterDraft();
    if (!draft.account?.email) {
      router.replace("/register");
      return;
    }
    if (draft.clinicName) setClinicName(draft.clinicName);
    if (draft.description) setDescription(draft.description);
    if (draft.address) setAddress(draft.address);
    if (draft.latitude != null && draft.longitude != null) {
      setLocation({
        latitude: draft.latitude,
        longitude: draft.longitude,
      });
    }
    if (draft.photoPreview) setPhotoPreview(draft.photoPreview);
  }, [router]);

  async function handleNext(e: React.FormEvent) {
    e.preventDefault();
    if (!clinicName.trim()) {
      setError("Nama klinik wajib diisi.");
      return;
    }
    if (!address.trim()) {
      setError("Alamat wajib diisi.");
      return;
    }
    if (!location) {
      setError("Pilih lokasi klinik di peta.");
      return;
    }
    saveRegisterDraft({
      clinicName: clinicName.trim(),
      description: description.trim(),
      address: address.trim(),
      latitude: location.latitude,
      longitude: location.longitude,
      photoPreview,
    });
    router.push("/register/klinik/jam");
  }

  return (
    <AuthShell
      title="Profil klinik"
      subtitle="Informasi dasar, lokasi di peta, dan foto"
      step={2}
      totalSteps={4}
    >
      <form onSubmit={handleNext} className="space-y-4">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2.5">
            {error}
          </p>
        )}
        <AuthTextField
          label="Nama klinik"
          required
          value={clinicName}
          onChange={(e) => setClinicName(e.target.value)}
          placeholder="Klinik Hewan ..."
        />
        <div>
          <label className="text-sm font-medium text-gray-700">Deskripsi</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1.5 w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Deskripsi singkat klinik"
          />
        </div>
        <ClinicMapPicker
          value={location}
          onChange={setLocation}
          onAddressResolved={(addr) => setAddress(addr)}
        />
        <div>
          <label className="text-sm font-medium text-gray-700">
            Alamat <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1.5 w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Alamat lengkap klinik"
          />
        </div>
        <ProfilePhotoPicker
          previewUrl={photoPreview}
          onChange={async (file, preview) => {
            await saveRegisterPhoto(file);
            setPhotoPreview(preview);
            saveRegisterDraft({ photoPreview: preview });
          }}
          onClear={async () => {
            await clearRegisterPhoto();
            setPhotoPreview(null);
            saveRegisterDraft({ photoPreview: null });
          }}
        />
        <button
          type="submit"
          className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
        >
          Lanjut
        </button>
      </form>
    </AuthShell>
  );
}
