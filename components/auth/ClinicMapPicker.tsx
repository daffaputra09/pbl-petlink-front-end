"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Search, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface MapLocation {
  latitude: number;
  longitude: number;
  label?: string;
}

interface SearchResult {
  displayName: string;
  lat: number;
  lon: number;
}

const DEFAULT_CENTER: [number, number] = [-7.9666, 112.6326];

const MapInner = dynamic(
  () => import("./ClinicMapInner").then((m) => m.ClinicMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="h-[320px] bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-sm text-gray-400">
        Memuat peta...
      </div>
    ),
  }
);

export function ClinicMapPicker({
  value,
  onChange,
  onAddressResolved,
}: {
  value: MapLocation | null;
  onChange: (loc: MapLocation) => void;
  onAddressResolved?: (address: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [draftPoint, setDraftPoint] = useState<[number, number]>(
    value ? [value.latitude, value.longitude] : DEFAULT_CENTER
  );

  useEffect(() => {
    if (value) {
      setDraftPoint([value.latitude, value.longitude]);
    }
  }, [value]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `/api/nominatim/search?q=${encodeURIComponent(q.trim())}`
      );
      const data = await res.json();
      if (!Array.isArray(data)) {
        setResults([]);
        return;
      }
      const mapped = data
        .map((item: { display_name?: string; lat?: string; lon?: string }) => {
          const lat = parseFloat(item.lat ?? "");
          const lon = parseFloat(item.lon ?? "");
          const displayName = item.display_name;
          if (!displayName || Number.isNaN(lat) || Number.isNaN(lon)) return null;
          return { displayName, lat, lon };
        })
        .filter(Boolean) as SearchResult[];
      setResults(mapped);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => search(query), 400);
    return () => clearTimeout(t);
  }, [query, open, search]);

  async function reverseGeocode(lat: number, lon: number) {
    setResolving(true);
    try {
      const res = await fetch(
        `/api/nominatim/reverse?lat=${lat}&lon=${lon}`
      );
      const data = await res.json();
      const display = data.display_name as string | undefined;
      if (display?.trim() && onAddressResolved) {
        onAddressResolved(display.trim());
      }
    } finally {
      setResolving(false);
    }
  }

  async function confirmLocation() {
    const [lat, lng] = draftPoint;
    const loc: MapLocation = {
      latitude: lat,
      longitude: lng,
      label: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    };
    onChange(loc);
    setOpen(false);
    await reverseGeocode(lat, lng);
  }

  const summary = useMemo(() => {
    if (!value) return null;
    return `${value.latitude.toFixed(5)}, ${value.longitude.toFixed(5)}`;
  }, [value]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Lokasi klinik <span className="text-red-500">*</span>
      </label>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 text-left hover:border-emerald-400 hover:bg-emerald-50/30 transition"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
          <MapPin size={20} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-medium text-gray-800">
            {value ? "Ubah lokasi di peta" : "Pilih lokasi di peta"}
          </span>
          <span className="block text-xs text-gray-500 truncate">
            {summary ?? "Ketuk untuk membuka peta OpenStreetMap"}
          </span>
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>Pilih Lokasi Klinik</DialogTitle>
          </DialogHeader>
          <div className="p-4 space-y-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari alamat di Indonesia..."
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-500"
              />
              {searching && (
                <Loader2
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400"
                />
              )}
            </div>
            {results.length > 0 && (
              <ul className="max-h-36 overflow-y-auto border border-gray-100 rounded-xl divide-y text-sm">
                {results.map((r) => (
                  <li key={`${r.lat}-${r.lon}`}>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-emerald-50"
                      onClick={() => {
                        setDraftPoint([r.lat, r.lon]);
                        setResults([]);
                        setQuery(r.displayName);
                      }}
                    >
                      {r.displayName}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <MapInner
              center={draftPoint}
              onPositionChange={(lat, lng) => setDraftPoint([lat, lng])}
            />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button
                type="button"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={confirmLocation}
                disabled={resolving}
              >
                {resolving ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : null}
                Gunakan lokasi ini
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
