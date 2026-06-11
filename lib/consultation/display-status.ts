export type ConsultationDisplayKind =
  | "belumDibayar"
  | "pembayaranGagal"
  | "terjadwal"
  | "berlangsung"
  | "selesai"
  | "dibatalkan";

export interface ConsultationDisplayStatus {
  kind: ConsultationDisplayKind;
  label: string;
  description: string;
  badgeClass: string;
}

export function resolveConsultationDisplayStatus(input: {
  consultationStatus: string;
  paymentStatus?: string | null;
  scheduledStartAt: Date;
  scheduledEndAt: Date;
}): ConsultationDisplayStatus {
  const now = new Date();
  const { consultationStatus, paymentStatus, scheduledStartAt, scheduledEndAt } =
    input;

  if (consultationStatus === "cancelled") {
    return preset("dibatalkan", "Konsultasi dibatalkan.");
  }

  if (consultationStatus === "completed") {
    return preset(
      "selesai",
      "Sesi konsultasi selesai. Chat tidak aktif kecuali customer membayar sesi baru."
    );
  }

  if (consultationStatus === "in_progress") {
    return preset("berlangsung", "Konsultasi sedang berlangsung via chat.");
  }

  if (consultationStatus === "pending_payment") {
    if (
      paymentStatus === "failed" ||
      paymentStatus === "expired" ||
      paymentStatus === "refunded"
    ) {
      return preset(
        "pembayaranGagal",
        "Pembayaran tidak berhasil. Customer perlu bayar ulang sebelum jadwal lewat."
      );
    }
    return preset(
      "belumDibayar",
      "Menunggu pembayaran agar konsultasi terjadwal."
    );
  }

  if (consultationStatus === "scheduled") {
    if (now >= scheduledStartAt && now < scheduledEndAt) {
      return preset(
        "berlangsung",
        "Sesi konsultasi sedang berjalan sesuai jadwal."
      );
    }
    return preset(
      "terjadwal",
      "Konsultasi terjadwal. Chat aktif saat sesi dimulai."
    );
  }

  return preset("terjadwal", `Status konsultasi: ${consultationStatus}`);
}

function preset(
  kind: ConsultationDisplayKind,
  description: string
): ConsultationDisplayStatus {
  switch (kind) {
    case "belumDibayar":
      return {
        kind,
        label: "Belum dibayar",
        description,
        badgeClass: "bg-amber-50 text-amber-700 border border-amber-200",
      };
    case "pembayaranGagal":
      return {
        kind,
        label: "Pembayaran gagal",
        description,
        badgeClass: "bg-red-50 text-red-600 border border-red-200",
      };
    case "terjadwal":
      return {
        kind,
        label: "Terjadwal",
        description,
        badgeClass: "bg-[#E8F5EF] text-[#1E6B4F] border border-[#1E6B4F]/25",
      };
    case "berlangsung":
      return {
        kind,
        label: "Berlangsung",
        description,
        badgeClass: "bg-[#E3F2FD] text-[#1565C0] border border-[#1565C0]/25",
      };
    case "selesai":
      return {
        kind,
        label: "Selesai",
        description,
        badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      };
    case "dibatalkan":
      return {
        kind,
        label: "Dibatalkan",
        description,
        badgeClass: "bg-gray-50 text-gray-500 border border-gray-200",
      };
  }
}
