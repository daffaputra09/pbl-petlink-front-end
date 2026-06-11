"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type LandingImagePlaceholderProps = {
  src: string;
  alt: string;
  label: string;
  className?: string;
  priority?: boolean;
};

export function LandingImagePlaceholder({
  src,
  alt,
  label,
  className,
  priority,
}: LandingImagePlaceholderProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-8 text-center",
          className
        )}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <ImageIcon className="h-7 w-7" />
        </div>
        <div>
          <p className="text-sm font-medium text-emerald-900">{label}</p>
          <p className="mt-1 text-xs text-emerald-600/80">
            Letakkan gambar di{" "}
            <code className="rounded bg-emerald-100 px-1 py-0.5 text-[10px]">
              public{src}
            </code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-emerald-100/80 bg-white shadow-xl shadow-emerald-900/10",
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover object-top"
        priority={priority}
        onError={() => setHasError(true)}
      />
    </div>
  );
}
