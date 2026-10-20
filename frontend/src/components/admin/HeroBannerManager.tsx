"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client";
import { errorMessages } from "@/lib/api-error";
import type { HeroBanner } from "@/lib/api-types";
import { ACCEPTED_IMAGE_TYPES, uploadImages } from "@/lib/upload-images";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Modal } from "@/components/admin/Modal";
import {
  btnGhost,
  btnIconDanger,
  btnIconEdit,
  btnPrimary,
  cardClass,
  inputClass,
  labelClass,
} from "@/components/admin/styles";

interface HeroBannerManagerProps {
  banners: HeroBanner[];
}

type Editing = { mode: "create" } | { mode: "edit"; banner: HeroBanner } | null;

export function HeroBannerManager({ banners }: HeroBannerManagerProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<Editing>(null);
  const [deleting, setDeleting] = useState<HeroBanner | null>(null);
  const [busyDelete, setBusyDelete] = useState(false);

  async function confirmDelete() {
    if (!deleting) return;
    setBusyDelete(true);
    try {
      await apiJson(`/hero-banners/${deleting.id}`, "DELETE");
      toast.success("Hero banner deleted");
      setDeleting(null);
      router.refresh();
    } catch (err) {
      toast.error(errorMessages(err, "Failed to delete hero banner").join(", "));
    } finally {
      setBusyDelete(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-text">Hero Banners</h1>
          <p className="mt-1 text-sm text-muted">
            Manage the headline promotional banners showcased at the top of the storefront
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing({ mode: "create" })}
          className={btnPrimary}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>New banner</span>
        </button>
      </div>

      {banners.length === 0 ? (
        <p className={`${cardClass} mt-6 p-8 text-center text-sm text-muted`}>
          No hero banners configured yet. Create one to display on the storefront.
        </p>
      ) : (
        <div className={`${cardClass} mt-6 overflow-x-auto`}>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-[13px] text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Banner</th>
                <th scope="col" className="px-4 py-3 font-medium">CTA Button</th>
                <th scope="col" className="px-4 py-3 font-medium">Position</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((banner) => (
                <tr key={banner.id} className="border-b border-border last:border-0 hover:bg-surface/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-24 shrink-0 overflow-hidden rounded-md border border-border bg-media-bg">
                        {/* eslint-disable-next-line @next/next/no-img-element -- storage image */}
                        <img src={banner.imageUrl} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <div className="font-semibold text-text">{banner.title}</div>
                        {banner.subtitle && (
                          <div className="text-xs text-muted line-clamp-1">{banner.subtitle}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {banner.ctaLabel ? (
                      <div className="text-xs">
                        <span className="font-medium text-text">{banner.ctaLabel}</span>
                        {banner.ctaUrl && <div className="text-muted">{banner.ctaUrl}</div>}
                      </div>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-muted">
                    {banner.position}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        banner.active ? "bg-sage-tint text-sage-dark" : "bg-rose text-muted"
                      }`}
                    >
                      {banner.active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        title="Edit banner"
                        aria-label="Edit banner"
                        onClick={() => setEditing({ mode: "edit", banner })}
                        className={btnIconEdit}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        title="Delete banner"
                        aria-label="Delete banner"
                        onClick={() => setDeleting(banner)}
                        className={btnIconDanger}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={editing !== null}
        title={editing?.mode === "edit" ? "Edit hero banner" : "New hero banner"}
        onClose={() => setEditing(null)}
      >
        {editing && (
          <HeroBannerForm
            key={editing.mode === "edit" ? editing.banner.id : "new"}
            banner={editing.mode === "edit" ? editing.banner : undefined}
            onCancel={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              router.refresh();
            }}
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleting !== null}
        title="Delete hero banner?"
        message={
          <>
            Are you sure you want to delete <strong>{deleting?.title}</strong>? Its image will also be removed from storage.
          </>
        }
        confirmLabel="Delete banner"
        busy={busyDelete}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}

interface HeroBannerFormProps {
  banner?: HeroBanner;
  onCancel: () => void;
  onSaved: () => void;
}

function HeroBannerForm({ banner, onCancel, onSaved }: HeroBannerFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(banner?.title ?? "");
  const [subtitle, setSubtitle] = useState(banner?.subtitle ?? "");
  const [imageUrl, setImageUrl] = useState(banner?.imageUrl ?? "");
  const [ctaLabel, setCtaLabel] = useState(banner?.ctaLabel ?? "");
  const [ctaUrl, setCtaUrl] = useState(banner?.ctaUrl ?? "");
  const [position, setPosition] = useState(String(banner?.position ?? 0));
  const [active, setActive] = useState(banner?.active ?? true);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleFileSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Please upload a PNG, JPEG, or WebP image");
      return;
    }

    setUploading(true);
    try {
      const urls = await uploadImages([file]);
      if (urls[0]) {
        setImageUrl(urls[0]);
        toast.success("Banner image uploaded");
      }
    } catch (err) {
      toast.error(errorMessages(err, "Failed to upload image").join(", "));
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!imageUrl) {
      setErrors(["Banner image is required"]);
      return;
    }

    setSubmitting(true);
    setErrors([]);

    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      imageUrl,
      ctaLabel: ctaLabel.trim(),
      ctaUrl: ctaUrl.trim(),
      position: Number(position) || 0,
      active,
    };

    try {
      if (banner) {
        await apiJson(`/hero-banners/${banner.id}`, "PATCH", payload);
        toast.success("Hero banner updated");
      } else {
        await apiJson("/hero-banners", "POST", payload);
        toast.success("Hero banner created");
      }
      onSaved();
    } catch (err) {
      setErrors(errorMessages(err));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="banner-title" className={labelClass}>
          Title *
        </label>
        <input
          id="banner-title"
          required
          autoFocus
          value={title}
          placeholder="e.g. Winter 4-in-1 Perfume Combo"
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="banner-subtitle" className={labelClass}>
          Subtitle
        </label>
        <input
          id="banner-subtitle"
          value={subtitle}
          placeholder="e.g. Hawas Ice, Sauvage, Bleu de Chanel & Vampire Blood"
          onChange={(e) => setSubtitle(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Banner image upload */}
      <div className="flex flex-col gap-1.5">
        <span className={labelClass}>Banner Image *</span>
        {imageUrl ? (
          <div className="relative aspect-video max-h-48 w-full overflow-hidden rounded-[10px] border border-border bg-media-bg">
            {/* eslint-disable-next-line @next/next/no-img-element -- uploaded banner */}
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-2 right-2 rounded-md bg-surface/90 px-3 py-1 text-xs font-medium text-text shadow-xs hover:bg-surface"
            >
              Change image
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[10px] border-2 border-dashed border-border bg-surface p-6 text-center hover:border-sage"
          >
            <svg className="h-8 w-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium text-text">{uploading ? "Uploading..." : "Upload banner image"}</p>
            <p className="text-xs text-muted">PNG, JPG or WebP (optimized for wide banners)</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          className="hidden"
          onChange={handleFileSelected}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="banner-cta-label" className={labelClass}>
            CTA Button Label
          </label>
          <input
            id="banner-cta-label"
            value={ctaLabel}
            placeholder="e.g. Order Now"
            onChange={(e) => setCtaLabel(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="banner-cta-url" className={labelClass}>
            CTA Button Link
          </label>
          <input
            id="banner-cta-url"
            value={ctaUrl}
            placeholder="e.g. /p/signature-perfume-combo"
            onChange={(e) => setCtaUrl(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 items-center">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="banner-position" className={labelClass}>
            Display Position
          </label>
          <input
            id="banner-position"
            type="number"
            min={0}
            step={1}
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className={inputClass}
          />
        </div>
        <label className="flex items-center gap-2 self-end pb-2.5 text-sm">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 accent-sage"
          />
          Active (shown on homepage)
        </label>
      </div>

      {errors.length > 0 && (
        <ul role="alert" className="list-disc pl-5 text-sm text-danger">
          {errors.map((msg) => (
            <li key={msg}>{msg}</li>
          ))}
        </ul>
      )}

      <div className="mt-2 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className={btnGhost}>
          Cancel
        </button>
        <button type="submit" disabled={submitting || uploading} className={btnPrimary}>
          {submitting ? "Saving..." : banner ? "Save changes" : "Create banner"}
        </button>
      </div>
    </form>
  );
}
