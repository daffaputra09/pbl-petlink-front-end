"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function PasswordField({
  label,
  required,
  error,
  className,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  error?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={className}>
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative mt-1.5">
        <input
          {...props}
          type={visible ? "text" : "password"}
          className={cn(
            "w-full border rounded-xl px-3.5 py-2.5 pr-11 text-sm text-gray-800 outline-none transition",
            "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",
            error
              ? "border-red-300 bg-red-50/50"
              : "border-gray-200 bg-white hover:border-gray-300"
          )}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          aria-label={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          aria-pressed={visible}
          tabIndex={-1}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
