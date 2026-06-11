import { Spinner } from "@/components/ui/Spinner";

export default function BookingListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-gray-100 bg-white p-5 animate-pulse"
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex gap-2">
              <div className="h-5 w-24 rounded-full bg-gray-100" />
              <div className="h-5 w-16 rounded-full bg-gray-100" />
            </div>
            <div className="h-4 w-20 rounded bg-gray-100" />
          </div>
          <div className="space-y-2">
            <div className="h-5 w-2/5 rounded bg-gray-100" />
            <div className="h-3 w-1/4 rounded bg-gray-100" />
            <div className="h-3 w-3/5 rounded bg-gray-100" />
          </div>
        </div>
      ))}
      <div className="flex items-center justify-center gap-2 py-2 text-gray-400">
        <Spinner size={18} className="text-gray-300" />
        <span className="text-xs">Memuat booking...</span>
      </div>
    </div>
  );
}
