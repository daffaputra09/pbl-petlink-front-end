"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Stethoscope, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Doctor } from "@/types/dokter";

const ALL_VALUE = "semua dokter klinik";

function doctorInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

type Props = {
  doctors: Doctor[];
  value: string;
  onChange: (doctorId: string) => void;
  className?: string;
  disabled?: boolean;
};

export default function DoctorSearchCombobox({
  doctors,
  value,
  onChange,
  className,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const selected = doctors.find((d) => d.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "h-10 w-full justify-between rounded-xl border-gray-200 bg-white px-3 font-normal hover:bg-gray-50",
            className
          )}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            {selected ? (
              <>
                <DoctorAvatar
                  name={selected.nama}
                  photo={selected.photo}
                  size="sm"
                />
                <span className="truncate text-sm text-gray-900">
                  {selected.nama}
                </span>
              </>
            ) : (
              <>
                <span className="w-7 h-7 rounded-full bg-[#E8F5EE] text-[#1E6B4F] flex items-center justify-center shrink-0">
                  <Users size={14} />
                </span>
                <span className="truncate text-sm text-gray-500">
                  Semua dokter
                </span>
              </>
            )}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[min(100vw-2rem,320px)] p-0 rounded-xl border-gray-200 shadow-lg"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Cari nama atau spesialisasi..." />
          <CommandList>
            <CommandEmpty>Dokter tidak ditemukan.</CommandEmpty>
            <CommandGroup heading="Dokter klinik">
              <CommandItem
                value={ALL_VALUE}
                keywords={["semua", "dokter", "all"]}
                onSelect={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="py-2.5"
              >
                <span className="w-8 h-8 rounded-full bg-[#E8F5EE] text-[#1E6B4F] flex items-center justify-center shrink-0">
                  <Users size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Semua dokter
                  </p>
                  <p className="text-xs text-gray-500">
                    Tampilkan seluruh riwayat
                  </p>
                </div>
                <Check
                  className={cn(
                    "ml-auto h-4 w-4 text-[#1E6B4F]",
                    value === "" ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>

              {doctors.map((doctor) => (
                <CommandItem
                  key={doctor.id}
                  value={`${doctor.nama} ${doctor.spesialisasi}`.toLowerCase()}
                  keywords={[doctor.nama, doctor.spesialisasi, doctor.email]}
                  onSelect={() => {
                    onChange(doctor.id);
                    setOpen(false);
                  }}
                  className="py-2.5"
                >
                  <DoctorAvatar
                    name={doctor.nama}
                    photo={doctor.photo}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {doctor.nama}
                    </p>
                    <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                      <Stethoscope size={11} className="shrink-0" />
                      {doctor.spesialisasi || "Spesialisasi belum diisi"}
                    </p>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4 shrink-0 text-[#1E6B4F]",
                      value === doctor.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function DoctorAvatar({
  name,
  photo,
  size = "md",
}: {
  name: string;
  photo?: string;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const text = size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <Avatar className={cn(dim, "shrink-0 border border-gray-100")}>
      {photo ? <AvatarImage src={photo} alt={name} /> : null}
      <AvatarFallback
        className={cn(
          "bg-[#E8F5EE] text-[#1E6B4F] font-semibold",
          text
        )}
      >
        {doctorInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
