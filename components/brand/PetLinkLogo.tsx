import Image from "next/image";
import { cn } from "@/lib/utils";

export type PetLinkLogoVariant =
  | "full"
  | "white"
  | "primary-200"
  | "primary-400";

const LOGO_SRC: Record<PetLinkLogoVariant, string> = {
  full: "/logo.png",
  white: "/logo-transparent-white.png",
  "primary-200": "/logo-transparent-primary-200.png",
  "primary-400": "/logo-transparent-primary-400.png",
};

type PetLinkLogoProps = {
  size?: number;
  className?: string;
  variant?: PetLinkLogoVariant;
  priority?: boolean;
};

export function PetLinkLogo({
  size = 40,
  className,
  variant = "full",
  priority,
}: PetLinkLogoProps) {
  const isFull = variant === "full";

  return (
    <Image
      src={LOGO_SRC[variant]}
      alt="PetLink"
      width={size}
      height={size}
      className={cn(
        isFull ? "rounded-xl object-cover" : "object-contain",
        className
      )}
      priority={priority ?? isFull}
    />
  );
}
