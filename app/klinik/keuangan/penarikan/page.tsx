"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wallet,
  Building2,
  CreditCard,
  User,
  AlertCircle,
  CheckCircle2,
  History,
  Settings,
  Info,
} from "lucide-react";
import StatCard from "@/components/keuangan/FinanceStatCard";
import {
  KlinikPageLayout,
  KlinikPageAlert,
  KlinikPageLoading,
  KlinikSectionCard,
  KlinikPrimaryButton,
  KlinikSecondaryButton,
} from "@/components/klinik/KlinikPageLayout";
import { Spinner } from "@/components/ui/Spinner";
import { useClinicFinance } from "@/hooks/use-clinic-finance";
import { formatRupiah } from "@/lib/keuangan/format";
import { notifyError } from "@/lib/ui/notify";

const MIN_PENARIKAN = 100_000;
const QUICK_AMOUNTS = [500_000, 1_000_000, 2_500_000, 5_000_000];

function parseAngka(val: string): number {
  return parseInt(val.replace(/\D/g, ""), 10) || 0;
}

function formatInput(val: string): string {
  const angka = val.replace(/\D/g, "");
  if (!angka) return "";
  return new Intl.NumberFormat("id-ID").format(parseInt(angka, 10));
}

function InfoLine({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-[#E8F5EE] text-[#1E6B4F] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-900 mt-0.5 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function PenarikanPage() {
  const router = useRouter();
  const {
    balance,
    bankAccount,
    loading,
    error,
    requestWithdraw,
  } = useClinicFinance();

  const [jumlah, setJumlah] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedAmount, setSubmittedAmount] = useState(0);
  const [jumlahError, setJumlahError] = useState<string | null>(null);

  const jumlahAngka = parseAngka(jumlah);
  const sisaSaldo = balance - jumlahAngka;

  const quickAmounts = useMemo(
    () =>
      QUICK_AMOUNTS.filter(
        (val) => val >= MIN_PENARIKAN && val <= balance
      ),
    [balance]
  );

  const validate = () => {
    if (!jumlah) {
      setJumlahError("Jumlah wajib diisi");
      return false;
    }
    if (jumlahAngka < MIN_PENARIKAN) {
      setJumlahError(`Minimal penarikan ${formatRupiah(MIN_PENARIKAN)}`);
      return false;
    }
    if (jumlahAngka > balance) {
      setJumlahError("Jumlah melebihi saldo tersedia");
      return false;
    }
    if (!bankAccount) {
      notifyError("Lengkapi data bank di pengaturan klinik.");
      return false;
    }
    setJumlahError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await requestWithdraw(jumlahAngka);
      setSubmittedAmount(jumlahAngka);
      setSuccess(true);
    } catch (e) {
      notifyError(e instanceof Error ? e.message : "Gagal mengajukan penarikan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNominalCepat = (val: number) => {
    setJumlah(formatInput(String(val)));
    setJumlahError(null);
  };

  if (success) {
    return (
      <KlinikPageLayout
        title="Permintaan Dikirim"
        description="Penarikan dana sedang ditinjau admin"
        maxWidth="6xl"
        backHref="/klinik/keuangan"
        backLabel="Kembali ke Keuangan"
      >
        <KlinikSectionCard className="max-w-lg mx-auto w-full">
          <div className="px-6 py-10 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Permohonan penarikan terkirim
              </h2>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Penarikan sebesar{" "}
                <span className="font-semibold text-gray-800">
                  {formatRupiah(submittedAmount)}
                </span>
                {bankAccount ? (
                  <>
                    {" "}
                    ke{" "}
                    <span className="font-semibold text-gray-800">
                      {bankAccount.bankName}
                    </span>{" "}
                    · {bankAccount.accountNumber}
                  </>
                ) : null}{" "}
                menunggu persetujuan admin.
              </p>
            </div>
            <p className="text-xs text-gray-400">
              Dana akan ditransfer setelah permohonan disetujui.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 w-full pt-2">
              <KlinikPrimaryButton
                className="flex-1 justify-center"
                onClick={() => router.push("/klinik/keuangan")}
              >
                Kembali ke Keuangan
              </KlinikPrimaryButton>
              <KlinikSecondaryButton
                className="flex-1 justify-center"
                onClick={() => router.push("/klinik/keuangan/penarikan/riwayat")}
              >
                Lihat Riwayat
              </KlinikSecondaryButton>
            </div>
          </div>
        </KlinikSectionCard>
      </KlinikPageLayout>
    );
  }

  return (
    <KlinikPageLayout
      title="Tarik Dana"
      description="Ajukan penarikan saldo klinik ke rekening terdaftar"
      maxWidth="6xl"
      backHref="/klinik/keuangan"
      backLabel="Kembali ke Keuangan"
      actions={
        <Link
          href="/klinik/keuangan/penarikan/riwayat"
          className="inline-flex items-center gap-2 bg-white text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition shrink-0"
        >
          <History size={16} />
          Riwayat Penarikan
        </Link>
      }
    >
      {loading ? (
        <KlinikPageLoading message="Memuat data penarikan..." />
      ) : (
        <>
          {error ? <KlinikPageAlert message={error} /> : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              label="Saldo Tersedia"
              value={formatRupiah(balance)}
              icon={<Wallet size={18} />}
              highlight
            />
            <StatCard
              label="Minimal Penarikan"
              value={formatRupiah(MIN_PENARIKAN)}
              icon={<Info size={18} />}
            />
          </div>

          <KlinikSectionCard
            title="Rekening Tujuan"
            description="Data diambil dari pengaturan klinik"
            actions={
              <Link
                href="/klinik/pengaturan"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E6B4F] hover:underline"
              >
                <Settings size={14} />
                Ubah rekening
              </Link>
            }
          >
            <div className="px-5 pb-5 pt-5">
              {bankAccount ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <InfoLine
                    icon={<Building2 size={16} />}
                    label="Bank"
                    value={bankAccount.bankName}
                  />
                  <InfoLine
                    icon={<CreditCard size={16} />}
                    label="Nomor Rekening"
                    value={bankAccount.accountNumber}
                  />
                  <InfoLine
                    icon={<User size={16} />}
                    label="Atas Nama"
                    value={bankAccount.accountName || "—"}
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 flex gap-3">
                  <AlertCircle
                    size={18}
                    className="text-amber-600 shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">
                      Data bank belum lengkap
                    </p>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                      Lengkapi bank, nomor rekening, dan atas nama di pengaturan
                      klinik sebelum mengajukan penarikan.
                    </p>
                    <Link
                      href="/klinik/pengaturan"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E6B4F] mt-2 hover:underline"
                    >
                      <Settings size={13} />
                      Ke Pengaturan
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </KlinikSectionCard>

          <KlinikSectionCard
            title="Nominal Penarikan"
            description="Masukkan jumlah yang ingin ditarik"
          >
            <div className="px-5 pb-5 pt-5 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="withdraw-amount"
                  className="text-sm font-semibold text-gray-700"
                >
                  Jumlah
                </label>
                <div
                  className={`flex items-center border rounded-xl px-4 py-3 gap-2 transition ${
                    jumlahError
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 focus-within:border-[#1E6B4F] focus-within:ring-2 focus-within:ring-[#1E6B4F]/10"
                  }`}
                >
                  <span className="text-sm text-gray-400 font-medium shrink-0">
                    Rp
                  </span>
                  <input
                    id="withdraw-amount"
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={jumlah}
                    onChange={(e) => {
                      setJumlah(formatInput(e.target.value));
                      setJumlahError(null);
                    }}
                    disabled={!bankAccount || balance < MIN_PENARIKAN}
                    className="flex-1 text-sm text-gray-900 font-semibold outline-none bg-transparent placeholder:font-normal placeholder:text-gray-300 disabled:opacity-60"
                  />
                </div>
                {jumlahError ? (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {jumlahError}
                  </p>
                ) : null}
                {jumlah && !jumlahError && jumlahAngka <= balance ? (
                  <p className="text-xs text-gray-400">
                    Sisa saldo setelah penarikan:{" "}
                    <span className="font-semibold text-gray-600">
                      {formatRupiah(Math.max(0, sisaSaldo))}
                    </span>
                  </p>
                ) : null}
              </div>

              {quickAmounts.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-medium text-gray-500">
                    Nominal cepat
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {quickAmounts.map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleNominalCepat(val)}
                        className="text-xs bg-[#E8F5EE] text-[#1E6B4F] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#1E6B4F] hover:text-white transition"
                      >
                        {formatRupiah(val)}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 flex gap-2">
                <AlertCircle
                  size={15}
                  className="text-amber-500 shrink-0 mt-0.5"
                />
                <p className="text-xs text-amber-700 leading-relaxed">
                  Permohonan akan ditinjau admin. Pastikan rekening tujuan sudah
                  benar sebelum mengirim.
                </p>
              </div>

              <KlinikPrimaryButton
                className="w-full justify-center py-3.5"
                disabled={
                  submitting ||
                  !bankAccount ||
                  balance < MIN_PENARIKAN
                }
                onClick={() => void handleSubmit()}
              >
                {submitting ? (
                  <>
                    <Spinner size={16} className="text-white" />
                    Memproses...
                  </>
                ) : (
                  "Ajukan Penarikan"
                )}
              </KlinikPrimaryButton>

              {balance < MIN_PENARIKAN ? (
                <p className="text-xs text-center text-gray-400">
                  Saldo belum mencapai minimal penarikan{" "}
                  {formatRupiah(MIN_PENARIKAN)}.
                </p>
              ) : null}
            </div>
          </KlinikSectionCard>
        </>
      )}
    </KlinikPageLayout>
  );
}
