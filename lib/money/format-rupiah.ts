/**
 * Format mata uang IDR — selalu nominal aktual tanpa pembulatan ke ribuan/juta.
 */
export function formatRupiah(amount: number): string {
  const value = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Alias — compact rounding dihapus agar angka keuangan selalu actual. */
export function formatRupiahCompact(amount: number): string {
  return formatRupiah(amount);
}

/**
 * Label sumbu grafik: nominal penuh untuk nilai di bawah 100 juta.
 */
export function formatRupiahAxis(amount: number): string {
  const value = Number.isFinite(amount) ? amount : 0;
  if (value === 0) return "0";
  if (value >= 100_000_000) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1,
    }).format(value);
  }
  return formatRupiah(value);
}
