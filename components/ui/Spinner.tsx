import { Loader2 } from "lucide-react";

type SpinnerProps = {
  size?: number;
  className?: string;
};

export function Spinner({ size = 20, className = "text-[#1E6B4F]" }: SpinnerProps) {
  return (
    <Loader2
      size={size}
      className={`animate-spin ${className}`}
      aria-hidden
    />
  );
}

export function LoadingBlock({
  message = "Memuat...",
  compact,
}: {
  message?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-gray-500 ${
        compact ? "py-10" : "py-16"
      }`}
    >
      <Spinner size={compact ? 24 : 32} />
      <p className="text-sm mt-3 font-medium">{message}</p>
    </div>
  );
}
