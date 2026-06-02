import imageCompression from "browser-image-compression";

export const PROFILE_IMAGE_MAX_BYTES = 2 * 1024 * 1024;

export class ProfileImageTooLargeError extends Error {
  constructor() {
    super(
      "Foto masih lebih dari 2 MB setelah dikompresi. Coba potong area lebih kecil."
    );
    this.name = "ProfileImageTooLargeError";
  }
}

export async function getCroppedImageBlob(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const size = Math.min(pixelCrop.width, pixelCrop.height);
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak didukung.");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size,
    size
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Gagal memproses foto."));
        else resolve(blob);
      },
      "image/jpeg",
      0.92
    );
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", () => reject(new Error("Gagal memuat gambar.")));
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url;
  });
}

export async function compressIfNeeded(blob: Blob): Promise<File> {
  if (blob.size < PROFILE_IMAGE_MAX_BYTES) {
    return new File([blob], `profile-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });
  }

  let quality = 0.88;
  let maxWidthOrHeight = 1200;
  let lastFile: File | null = null;

  while (quality >= 0.4) {
    const compressed = await imageCompression(
      new File([blob], "temp.jpg", { type: "image/jpeg" }),
      {
        maxSizeMB: 1.9,
        maxWidthOrHeight,
        useWebWorker: true,
        fileType: "image/jpeg",
        initialQuality: quality,
      }
    );

    lastFile = new File([compressed], `profile-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });

    if (compressed.size < PROFILE_IMAGE_MAX_BYTES) {
      return lastFile;
    }

    quality -= 0.12;
    maxWidthOrHeight = Math.max(480, Math.round(maxWidthOrHeight * 0.88));
  }

  if (lastFile && lastFile.size < PROFILE_IMAGE_MAX_BYTES) {
    return lastFile;
  }

  throw new ProfileImageTooLargeError();
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Gagal membaca file."));
    reader.readAsDataURL(file);
  });
}
