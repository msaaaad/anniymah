"use client";

import { ChangeEvent, useState } from "react";
import imageCompression from "browser-image-compression";

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
}

type UploadState = "idle" | "compressing" | "uploading" | "error";

export function ImageUploader({ label, value, onChange }: ImageUploaderProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState("");

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setError("");
    try {
      setState("compressing");
      // Keep uploads small: Supabase's free tier caps storage/bandwidth,
      // so every image is shrunk to ~200KB WebP before it ever leaves the browser.
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        fileType: "image/webp",
      });

      setState("uploading");
      const formData = new FormData();
      const webpFile = new File(
        [compressed],
        file.name.replace(/\.[^.]+$/, "") + ".webp",
        { type: "image/webp" }
      );
      formData.append("file", webpFile);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Upload failed");
      }
      const { url } = await res.json();
      onChange(url);
      setState("idle");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  const busy = state === "compressing" || state === "uploading";

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] text-muted">{label}</label>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-media-bg">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element -- local upload path, not worth next/image config for an MVP
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-[10px] text-muted">No image</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-[8px] border border-border bg-surface px-4 py-2 text-sm hover:border-sage-dark hover:text-sage-dark">
            {busy
              ? state === "compressing"
                ? "Compressing..."
                : "Uploading..."
              : value
                ? "Replace image"
                : "Upload image"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              disabled={busy}
              onChange={handleFile}
            />
          </label>
          {value && !busy && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="w-fit text-xs text-muted hover:text-rose-dark"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-rose-dark">{error}</p>}
    </div>
  );
}
