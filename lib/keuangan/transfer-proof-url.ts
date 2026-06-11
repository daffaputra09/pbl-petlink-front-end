const LEGACY_PREFIX = "legacy:no-transfer-proof";

export function isLegacyTransferProofUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  return url.trim() === LEGACY_PREFIX || url.trim().startsWith("legacy:");
}

export function isViewableTransferProofUrl(
  url: string | null | undefined
): url is string {
  return !!url?.trim() && !isLegacyTransferProofUrl(url);
}
