"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { errorMessages } from "@/lib/api-error";
import { ACCEPTED_IMAGE_TYPES, uploadImages } from "@/lib/upload-images";
import { MAX_PRODUCT_IMAGES } from "@/lib/api-types";
import { btnGhost, labelClass } from "@/components/admin/styles";

interface MultiImageUploaderProps {
  urls: string[];
  onChange: (urls: string[]) => void;
}

export function MultiImageUploader({ urls, onChange }: MultiImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const remaining = MAX_PRODUCT_IMAGES - urls.length;

  async function addFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((file) => ACCEPTED_IMAGE_TYPES.includes(file.type));
    if (files.length === 0) {
      toast.error("Only PNG, JPEG or WebP images are supported");
      return;
    }
    const accepted = files.slice(0, remaining);
    if (accepted.length < files.length) {
      toast.error(`Only ${MAX_PRODUCT_IMAGES} images per product — extra files were skipped`);
    }
    if (accepted.length === 0) return;

    setUploading(true);
    try {
      const uploaded = await uploadImages(accepted);
      onChange([...urls, ...uploaded]);
    } catch (err) {
      toast.error(errorMessages(err, "Upload failed").join(", "));
    } finally {
      setUploading(false);
    }
  }

  function move(index: number, delta: -1 | 1) {
    const next = [...urls];
    const target = index + delta;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className={labelClass} id="images-label">
        Images ({urls.length}/{MAX_PRODUCT_IMAGES}) — first image is the cover
      </span>

      {urls.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-labelledby="images-label">
          {urls.map((url, index) => (
            <li key={url} className="overflow-hidden rounded-[10px] border border-border bg-surface">
              <div className="relative aspect-square bg-media-bg">
                {/* eslint-disable-next-line @next/next/no-img-element -- remote storage URL, not worth next/image config */}
                <img src={url} alt={`Product image ${index + 1}`} className="h-full w-full object-cover" />
                {index === 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-rose px-2 py-0.5 text-[11px] font-medium text-text">
                    Cover
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1 p-2">
                <div className="flex gap-1">
                  <button
                    type="button"
                    aria-label={`Move image ${index + 1} earlier`}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    className="rounded-md border border-border px-2 py-1 text-xs hover:border-sage-dark disabled:opacity-40"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    aria-label={`Move image ${index + 1} later`}
                    disabled={index === urls.length - 1}
                    onClick={() => move(index, 1)}
                    className="rounded-md border border-border px-2 py-1 text-xs hover:border-sage-dark disabled:opacity-40"
                  >
                    →
                  </button>
                </div>
                <button
                  type="button"
                  aria-label={`Remove image ${index + 1}`}
                  onClick={() => onChange(urls.filter((_, i) => i !== index))}
                  className="rounded-md border border-danger/60 px-2 py-0.5 text-xs font-medium text-danger transition-colors hover:bg-danger hover:text-white"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {remaining > 0 && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (!uploading) void addFiles(e.dataTransfer.files);
          }}
          className={`flex flex-col items-center gap-2 rounded-[10px] border-2 border-dashed px-4 py-6 text-center text-sm transition-colors ${
            dragOver ? "border-sage bg-sage-tint" : "border-border bg-surface"
          }`}
        >
          <p className="text-muted">{uploading ? "Compressing and uploading..." : "Drag images here, or"}</p>
          <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()} className={btnGhost}>
            Choose images
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => {
              if (e.target.files) void addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <p className="text-xs text-muted">PNG, JPEG or WebP · up to {remaining} more</p>
        </div>
      )}
    </div>
  );
}
