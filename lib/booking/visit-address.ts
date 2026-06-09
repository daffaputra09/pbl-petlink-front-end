/** Ekstrak alamat kunjungan dari kolom notes — selaras dengan petlink. */
export function visitAddressFromNotes(notes?: string | null): string | null {
  if (!notes?.trim()) return null;
  const prefix = "Alamat kunjungan:";
  for (const line of notes.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith(prefix)) {
      const address = trimmed.slice(prefix.length).trim();
      return address || null;
    }
  }
  return null;
}

export function googleMapsDirectionsUrl(params: {
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
}): string | null {
  const { latitude, longitude, address } = params;
  if (latitude != null && longitude != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  }
  if (address?.trim()) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address.trim())}`;
  }
  return null;
}
