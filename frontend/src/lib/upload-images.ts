import imageCompression from "browser-image-compression";
import { apiRequest } from "@/lib/api-client";

export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

async function toCompressedWebp(file: File): Promise<File> {
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: "image/webp",
  });
  return new File([compressed], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
}

// Step 1 of the product flow: POST /uploads returns public URLs in the same
// order as the files; those URLs then go into the product payload's `images`.
export async function uploadImages(files: File[]): Promise<string[]> {
  const compressed = await Promise.all(files.map(toCompressedWebp));
  const formData = new FormData();
  for (const file of compressed) formData.append("files", file);

  const { urls } = await apiRequest<{ urls: string[] }>("/uploads", { method: "POST", body: formData });
  return urls;
}
