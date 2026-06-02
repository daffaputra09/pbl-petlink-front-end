"use client";

import { cn } from "@/lib/utils";

export function AuthTextField({
  label,
  required,
  error,
  hint,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
}) {
  return (
    <div className={className}>
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        {...props}
        className={cn(
          "mt-1.5 w-full border rounded-xl px-3.5 py-2.5 text-sm text-gray-800 outline-none transition",
          "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",
          error
            ? "border-red-300 bg-red-50/50"
            : "border-gray-200 bg-white hover:border-gray-300"
        )}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1 text-xs text-gray-400">{hint}</p>
      )}
    </div>
  );
}
