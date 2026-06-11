import Image from "next/image";
import { cn } from "@/lib/utils";

type PetLinkLogoProps = {
  size?: number;
  className?: string;
};

export function PetLinkLogo({ size = 40, className }: PetLinkLogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="PetLink"
      width={size}
      height={size}
      className={cn("rounded-xl object-cover", className)}
      priority
    />
  );
}
