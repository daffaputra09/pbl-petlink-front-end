"use client";

import { useEffect, useState } from "react";

export const DURATION_PRESETS = [15, 30, 45, 60, 90, 120] as const;

interface DurationPickerProps {
  value: number;
  onChange: (minutes: number) => void;
  error?: string;
}

function isPresetValue(minutes: number) {
  return (DURATION_PRESETS as readonly number[]).includes(minutes);
}

function formatDurationLabel(minutes: number) {
  if (minutes < 60) return `${minutes} mnt`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} jam` : `${h}j ${m}m`;
}

export default function DurationPicker({
  value,
  onChange,
  error,
}: DurationPickerProps) {
  const [customMode, setCustomMode] = useState(() => !isPresetValue(value));

  useEffect(() => {
    setCustomMode(!isPresetValue(value));
  }, [value]);

  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-2">
        Durasi Estimasi *
      </label>
      <div className="flex flex-wrap gap-2 mb-3">
        {DURATION_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => {
              setCustomMode(false);
              onChange(preset);
            }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              !customMode && value === preset
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300"
            }`}
          >
            {formatDurationLabel(preset)}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setCustomMode(true);
            if (isPresetValue(value)) onChange(75);
          }}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            customMode
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300"
          }`}
        >
          Kustom
        </button>
      </div>
      {customMode ? (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={480}
            step={1}
            value={value || ""}
            onChange={(e) => {
              const n = Number.parseInt(e.target.value, 10);
              onChange(Number.isNaN(n) ? 0 : n);
            }}
            placeholder="Menit"
            className={`w-28 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none ${
              error ? "border-red-400" : "border-gray-200"
            }`}
          />
          <span className="text-sm text-gray-500">menit (1–480)</span>
        </div>
      ) : null}
      {error ? <p className="text-xs text-red-500 mt-1">{error}</p> : null}
    </div>
  );
}
