"use client";

import { useState } from "react";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Building2,
} from "lucide-react";
import { AdminPageSearch } from "@/components/layout/AdminPageSearch";
import { useAdminWithdrawals } from "@/hooks/use-admin-withdrawals";
import { formatRupiah, formatDateId } from "@/lib/admin/format";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function AdminPenarikanPage() {
  const [search, setSearch] = useState("");
  const { items, loading, error, processRequest } = useAdminWithdrawals({
    status: "pending",
    search,
  });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  async function handleApprove(id: string) {
    setBusyId(id);
    try {
      await processRequest(id, "approve");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menyetujui");
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject() {
    if (!rejectId || !rejectReason.trim()) return;
    setBusyId(rejectId);
    try {
      await processRequest(rejectId, "reject", rejectReason.trim());
      setRejectId(null);
      setRejectReason("");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menolak");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Penarikan Dana</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tinjau permohonan penarikan dana yang menunggu persetujuan.
          </p>
        </div>
        <AdminPageSearch
          placeholder="Cari nama klinik..."
          value={search}
          onChange={setSearch}
        />
      </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-4">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-16 bg-white rounded-2xl border">
            Tidak ada permohonan pending.
          </p>
        ) : (
          <div className="space-y-4">
            {items.map((w) => (
              <div
                key={w.id}
                className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
                  <div className="flex gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shrink-0">
                      {w.clinic_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        <Building2 size={16} className="text-gray-400" />
                        {w.clinic_name}
                      </p>
                      <p className="text-lg font-bold text-emerald-700 mt-1">
                        {formatRupiah(Number(w.amount))}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDateId(w.created_at)}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        {w.bank_name} — {w.account_number}
                        <br />
                        a.n {w.account_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      disabled={busyId === w.id}
                      onClick={() => {
                        setRejectId(w.id);
                        setRejectReason("");
                      }}
                    >
                      <XCircle size={16} className="mr-1" />
                      Tolak
                    </Button>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={busyId === w.id}
                      onClick={() => handleApprove(w.id)}
                    >
                      {busyId === w.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={16} className="mr-1" />
                      )}
                      Setujui
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      <Dialog open={!!rejectId} onOpenChange={() => setRejectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alasan penolakan</DialogTitle>
          </DialogHeader>
          <textarea
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Jelaskan alasan penolakan..."
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm"
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setRejectId(null)}>
              Batal
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              disabled={!rejectReason.trim() || busyId === rejectId}
              onClick={handleReject}
            >
              Tolak permohonan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
