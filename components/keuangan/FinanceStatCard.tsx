interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: { value: string; positive: boolean };
  highlight?: boolean;
}

export default function FinanceStatCard({ label, value, icon, trend, highlight }: StatCardProps) {
  return (
    <div
      className={`rounded-2xl p-5 flex flex-col gap-3 ${
        highlight
          ? "bg-[#1E6B4F] text-white"
          : "bg-white border border-gray-100 shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${highlight ? "text-white/70" : "text-gray-500"}`}>
          {label}
        </span>
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            highlight ? "bg-white/20 text-white" : "bg-[#E8F5EE] text-[#1E6B4F]"
          }`}
        >
          {icon}
        </div>
      </div>
      <div>
        <p className={`text-2xl font-bold tracking-tight ${highlight ? "text-white" : "text-gray-900"}`}>
          {value}
        </p>
        {trend && (
          <p className={`text-xs mt-1 font-medium ${
            highlight
              ? "text-white/70"
              : trend.positive
              ? "text-emerald-500"
              : "text-red-400"
          }`}>
            {trend.positive ? "↑" : "↓"} {trend.value} dari kemarin
          </p>
        )}
      </div>
    </div>
  );
}
