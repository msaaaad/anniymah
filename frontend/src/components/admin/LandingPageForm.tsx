"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client";
import { errorMessages } from "@/lib/api-error";
import type { LandingPageAdmin, LandingPagePayload } from "@/lib/api-types";
import { slugify } from "@/lib/slug";
import { ACCEPTED_IMAGE_TYPES, uploadImages } from "@/lib/upload-images";
import { btnGhost, btnPrimary, cardClass, inputClass, labelClass } from "@/components/admin/styles";

interface LandingPageFormProps {
  page?: LandingPageAdmin;
}

interface CollectionItemState {
  name: string;
  description: string;
  imageUrl?: string;
}

interface FeatureItemState {
  title: string;
  description: string;
}

function parseCollectionItems(raw: unknown[]): CollectionItemState[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (typeof item === "object" && item !== null) {
      const rec = item as Record<string, unknown>;
      return {
        name: String(rec.name ?? ""),
        description: String(rec.description ?? ""),
        imageUrl: typeof rec.imageUrl === "string" ? rec.imageUrl : undefined,
      };
    }
    return { name: "", description: "" };
  });
}

function parseFeatures(raw: unknown[]): FeatureItemState[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (typeof item === "object" && item !== null) {
      const rec = item as Record<string, unknown>;
      return {
        title: String(rec.title ?? ""),
        description: String(rec.description ?? ""),
      };
    }
    return { title: "", description: "" };
  });
}

function parseShippingBarItems(raw: unknown[]): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string") return item;
      if (typeof item === "object" && item !== null) {
        const rec = item as Record<string, unknown>;
        return String(rec.text ?? rec.title ?? rec.label ?? "");
      }
      return "";
    })
    .filter(Boolean);
}

export function LandingPageForm({ page }: LandingPageFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Core fields
  const [title, setTitle] = useState(page?.title ?? "");
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(page));
  const [description, setDescription] = useState(page?.description ?? "");
  const [price, setPrice] = useState(page?.price ? String(page.price) : "0");
  const [regularPrice, setRegularPrice] = useState(page?.regularPrice ? String(page.regularPrice) : "0");
  const [phone, setPhone] = useState(page?.phone ?? "");
  const [imageUrl, setImageUrl] = useState(page?.imageUrl ?? "");

  // Delivery
  const [freeDelivery, setFreeDelivery] = useState(page?.freeDelivery ?? true);
  const [chargeInside, setChargeInside] = useState(String(page?.deliveryChargeInsideDhaka ?? 0));
  const [chargeOutside, setChargeOutside] = useState(String(page?.deliveryChargeOutsideDhaka ?? 0));

  // Features section
  const [featuresEnabled, setFeaturesEnabled] = useState(Boolean(page?.featuresEnabled));
  const [featuresTitle, setFeaturesTitle] = useState(page?.featuresTitle ?? "কেন আমাদের আতর অনন্য?");
  const [featuresSubtitle, setFeaturesSubtitle] = useState(page?.featuresSubtitle ?? "");
  const [features, setFeatures] = useState<FeatureItemState[]>(
    parseFeatures(page?.features ?? [])
  );

  // Collection section
  const [collectionEnabled, setCollectionEnabled] = useState(Boolean(page?.collectionEnabled));
  const [collectionTitle, setCollectionTitle] = useState(page?.collectionTitle ?? "কম্বোর ভেতরে যা থাকছে");
  const [collectionItems, setCollectionItems] = useState<CollectionItemState[]>(
    parseCollectionItems(page?.collectionItems ?? [])
  );

  // Shipping bar section
  const [shippingBarEnabled, setShippingBarEnabled] = useState(Boolean(page?.shippingBarEnabled));
  const [shippingBarItems, setShippingBarItems] = useState<string[]>(
    parseShippingBarItems(page?.shippingBarItems ?? [])
  );

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  // Hero Image file picker
  async function handleHeroImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Please select a PNG, JPEG, or WebP image");
      return;
    }

    setUploadingImage(true);
    try {
      const urls = await uploadImages([file]);
      if (urls[0]) {
        setImageUrl(urls[0]);
        toast.success("Hero image uploaded");
      }
    } catch (err) {
      toast.error(errorMessages(err).join("\n") || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  }

  // Collection item upload
  async function handleCollectionItemImage(index: number, file: File) {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Please select a PNG, JPEG, or WebP image");
      return;
    }
    try {
      const urls = await uploadImages([file]);
      if (urls[0]) {
        setCollectionItems((prev) =>
          prev.map((item, i) => (i === index ? { ...item, imageUrl: urls[0] } : item))
        );
        toast.success("Item image uploaded");
      }
    } catch (err) {
      toast.error(errorMessages(err).join("\n") || "Failed to upload item image");
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors([]);

    const cleanSlug = slug.trim().toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug)) {
      setErrors(["Slug must be lowercase letters, numbers, and hyphens without double hyphens."]);
      setSubmitting(false);
      return;
    }

    // Backend expects shippingBarItems as objects: JsonItem[] or strings
    // Let's pass objects: [{ text: item }] so it satisfies both @IsObject({ each: true }) and string display
    const formattedShippingBarItems = shippingBarItems
      .filter((s) => s.trim().length > 0)
      .map((text) => ({ text: text.trim() }));

    const formattedCollectionItems = collectionItems
      .filter((item) => item.name.trim().length > 0)
      .map((item) => ({
        name: item.name.trim(),
        description: item.description.trim(),
        imageUrl: item.imageUrl || "",
      }));

    const formattedFeatures = features
      .filter((f) => f.title.trim().length > 0)
      .map((f) => ({
        title: f.title.trim(),
        description: f.description.trim(),
      }));

    const payload: LandingPagePayload = {
      slug: cleanSlug,
      title: title.trim(),
      description: description.trim(),
      price: Math.max(0, parseInt(price, 10) || 0),
      regularPrice: Math.max(0, parseInt(regularPrice, 10) || 0),
      phone: phone.trim(),
      imageUrl: imageUrl.trim(),
      freeDelivery,
      deliveryChargeInsideDhaka: Math.max(0, parseInt(chargeInside, 10) || 0),
      deliveryChargeOutsideDhaka: Math.max(0, parseInt(chargeOutside, 10) || 0),
      featuresEnabled,
      featuresTitle: featuresTitle.trim(),
      featuresSubtitle: featuresSubtitle.trim(),
      features: formattedFeatures,
      collectionEnabled,
      collectionTitle: collectionTitle.trim(),
      collectionItems: formattedCollectionItems,
      shippingBarEnabled,
      shippingBarItems: formattedShippingBarItems,
    };

    try {
      if (page) {
        await apiJson(`/landing-pages/${page.id}`, "PATCH", payload);
        toast.success("Landing page updated successfully");
      } else {
        await apiJson("/landing-pages", "POST", payload);
        toast.success("Landing page created successfully");
      }
      router.push("/admin/landing-pages");
      router.refresh();
    } catch (err) {
      setErrors(errorMessages(err));
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-text sm:text-3xl">
            {page ? `Edit Landing Page: ${page.title || page.slug}` : "Create New Landing Page"}
          </h1>
          <p className="mt-1 text-xs text-muted sm:text-sm">
            Configure headline offer, pricing, visuals, and promotional blocks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/landing-pages" className={btnGhost}>
            Cancel
          </Link>
          <button type="submit" disabled={submitting} className={btnPrimary}>
            {submitting ? "Saving..." : page ? "Save Changes" : "Publish Landing Page"}
          </button>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="rounded-[10px] border border-red-200 bg-red-50 p-4 text-xs sm:text-sm text-red-800">
          <p className="font-bold">Please correct the following errors:</p>
          <ul className="mt-1 list-disc pl-5 space-y-1">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 1. Core Offer & Hero Section */}
      <div className={`${cardClass} p-5 space-y-4`}>
        <div className="border-b border-border pb-3">
          <h2 className="font-heading text-base font-semibold text-text">Campaign Overview & Offer</h2>
          <p className="text-xs text-muted">Primary headline, pricing, and campaign URL</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Campaign Title / Heading</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Royal Oud Luxury Combo"
              className={`${inputClass} mt-1 text-xs sm:text-sm`}
            />
          </div>

          <div>
            <label className={labelClass}>URL Slug (Unique path /p/slug)</label>
            <input
              type="text"
              required
              value={slug}
              pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
              title="Lowercase letters, numbers, and single hyphens only"
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value.toLowerCase());
              }}
              placeholder="e.g. royal-oud-combo"
              className={`${inputClass} mt-1 font-mono text-xs sm:text-sm`}
            />
            <p className="mt-1 text-[11px] text-muted">Accessible publicly at: /p/{slug || "your-slug"}</p>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Campaign Subtitle / Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short captivating hook describing this exclusive combo or offer..."
              className={`${inputClass} mt-1 text-xs sm:text-sm`}
            />
          </div>

          <div>
            <label className={labelClass}>Special Offer Price (৳)</label>
            <input
              type="number"
              min="0"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={`${inputClass} mt-1 font-mono text-xs sm:text-sm`}
            />
          </div>

          <div>
            <label className={labelClass}>Regular / Original Price (৳)</label>
            <input
              type="number"
              min="0"
              value={regularPrice}
              onChange={(e) => setRegularPrice(e.target.value)}
              placeholder="Shown crossed out if higher than price"
              className={`${inputClass} mt-1 font-mono text-xs sm:text-sm`}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Direct Contact / Helpline Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 01712345678"
              className={`${inputClass} mt-1 font-mono text-xs sm:text-sm`}
            />
            <p className="mt-1 text-[11px] text-muted">Displayed under the order button as a direct call channel</p>
          </div>
        </div>

        {/* Hero Visual Image */}
        <div className="pt-3 border-t border-border">
          <label className={labelClass}>Campaign Hero Image</label>
          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[10px] border border-border bg-media-bg">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="Hero preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted">No Image</div>
              )}
            </div>

            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleHeroImageUpload}
              />
              <button
                type="button"
                disabled={uploadingImage}
                onClick={() => fileInputRef.current?.click()}
                className={`${btnGhost} text-xs py-2 px-3`}
              >
                {uploadingImage ? "Uploading Image..." : imageUrl ? "Replace Image" : "Upload Hero Image"}
              </button>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="text-xs text-red-600 hover:underline block"
                >
                  Remove image
                </button>
              )}
              <p className="text-[11px] text-muted">PNG, JPG or WebP (recommended 800×800 or high resolution product shot)</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Delivery & Shipping Rates */}
      <div className={`${cardClass} p-5 space-y-4`}>
        <div className="border-b border-border pb-3">
          <h2 className="font-heading text-base font-semibold text-text">Shipping & Delivery Terms</h2>
          <p className="text-xs text-muted">Configure whether delivery is complimentary or charged for this landing page</p>
        </div>

        <label className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
          <input
            type="checkbox"
            checked={freeDelivery}
            onChange={(e) => setFreeDelivery(e.target.checked)}
            className="h-4 w-4 accent-sage"
          />
          <span>Offer Free Delivery on this campaign</span>
        </label>

        {!freeDelivery && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
            <div>
              <label className={labelClass}>Inside Dhaka Delivery Charge (৳)</label>
              <input
                type="number"
                min="0"
                value={chargeInside}
                onChange={(e) => setChargeInside(e.target.value)}
                className={`${inputClass} mt-1 font-mono text-xs sm:text-sm`}
              />
            </div>
            <div>
              <label className={labelClass}>Outside Dhaka Delivery Charge (৳)</label>
              <input
                type="number"
                min="0"
                value={chargeOutside}
                onChange={(e) => setChargeOutside(e.target.value)}
                className={`${inputClass} mt-1 font-mono text-xs sm:text-sm`}
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Features Section Builder */}
      <div className={`${cardClass} p-5 space-y-4`}>
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="font-heading text-base font-semibold text-text">Features & Value Highlights</h2>
            <p className="text-xs text-muted">Key selling points (e.g. longevity, authentic notes, premium glass bottle)</p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={featuresEnabled}
              onChange={(e) => setFeaturesEnabled(e.target.checked)}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-border peer-checked:bg-sage peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-['']" />
            <span className="ml-2 text-xs font-semibold text-text">
              {featuresEnabled ? "Enabled" : "Disabled"}
            </span>
          </label>
        </div>

        {featuresEnabled && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Section Title</label>
                <input
                  type="text"
                  value={featuresTitle}
                  onChange={(e) => setFeaturesTitle(e.target.value)}
                  placeholder="কেন আমাদের আতর অনন্য?"
                  className={`${inputClass} mt-1 text-xs sm:text-sm`}
                />
              </div>
              <div>
                <label className={labelClass}>Section Subtitle</label>
                <input
                  type="text"
                  value={featuresSubtitle}
                  onChange={(e) => setFeaturesSubtitle(e.target.value)}
                  placeholder="ঐতিহ্যবাহী সুবাস এবং আধুনিক পারফিউমের মেলবন্ধন"
                  className={`${inputClass} mt-1 text-xs sm:text-sm`}
                />
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-text">Features List:</span>
              {features.map((feat, idx) => (
                <div key={idx} className="flex flex-col gap-2 rounded-[8px] border border-border p-3 sm:flex-row sm:items-center">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={feat.title}
                      onChange={(e) =>
                        setFeatures((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, title: e.target.value } : item))
                        )
                      }
                      placeholder={`Feature #${idx + 1} Title (e.g. দীর্ঘস্থায়ী সুবাস)`}
                      className={`${inputClass} text-xs py-1.5`}
                    />
                    <input
                      type="text"
                      value={feat.description}
                      onChange={(e) =>
                        setFeatures((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, description: e.target.value } : item))
                        )
                      }
                      placeholder="Description of this feature..."
                      className={`${inputClass} text-xs py-1.5`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setFeatures((prev) => prev.filter((_, i) => i !== idx))}
                    className="self-end text-xs text-red-600 hover:underline sm:self-center"
                  >
                    Delete
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setFeatures((prev) => [...prev, { title: "", description: "" }])}
                className={`${btnGhost} text-xs py-1.5 px-3`}
              >
                + Add Feature
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Collection Items Builder */}
      <div className={`${cardClass} p-5 space-y-4`}>
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="font-heading text-base font-semibold text-text">Combo Box Contents / Collection</h2>
            <p className="text-xs text-muted">Showcase the individual items included inside this combo package</p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={collectionEnabled}
              onChange={(e) => setCollectionEnabled(e.target.checked)}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-border peer-checked:bg-sage peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-['']" />
            <span className="ml-2 text-xs font-semibold text-text">
              {collectionEnabled ? "Enabled" : "Disabled"}
            </span>
          </label>
        </div>

        {collectionEnabled && (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Collection Section Title</label>
              <input
                type="text"
                value={collectionTitle}
                onChange={(e) => setCollectionTitle(e.target.value)}
                placeholder="কম্বোর ভেতরে যা থাকছে"
                className={`${inputClass} mt-1 text-xs sm:text-sm`}
              />
            </div>

            {/* Collection Items List */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-text">Package Items:</span>
              {collectionItems.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-3 rounded-[8px] border border-border p-3 sm:flex-row sm:items-center">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[6px] border border-border bg-media-bg">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-muted">No Pic</div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        setCollectionItems((prev) =>
                          prev.map((c, i) => (i === idx ? { ...c, name: e.target.value } : c))
                        )
                      }
                      placeholder={`Item #${idx + 1} Name (e.g. Amber Oud EDP 15ml)`}
                      className={`${inputClass} text-xs py-1.5`}
                    />
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        setCollectionItems((prev) =>
                          prev.map((c, i) => (i === idx ? { ...c, description: e.target.value } : c))
                        )
                      }
                      placeholder="Short note or notes breakdown..."
                      className={`${inputClass} text-xs py-1.5`}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className={`${btnGhost} text-[11px] py-1 px-2 cursor-pointer`}>
                      Upload Photo
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleCollectionItemImage(idx, f);
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setCollectionItems((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setCollectionItems((prev) => [...prev, { name: "", description: "" }])
                }
                className={`${btnGhost} text-xs py-1.5 px-3`}
              >
                + Add Combo Item
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Shipping & Trust Bar Builder */}
      <div className={`${cardClass} p-5 space-y-4`}>
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="font-heading text-base font-semibold text-text">Shipping & Trust Badges Bar</h2>
            <p className="text-xs text-muted">Short guarantee points displayed right before the order confirmation form</p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={shippingBarEnabled}
              onChange={(e) => setShippingBarEnabled(e.target.checked)}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-border peer-checked:bg-sage peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-['']" />
            <span className="ml-2 text-xs font-semibold text-text">
              {shippingBarEnabled ? "Enabled" : "Disabled"}
            </span>
          </label>
        </div>

        {shippingBarEnabled && (
          <div className="space-y-3">
            {shippingBarItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) =>
                    setShippingBarItems((prev) =>
                      prev.map((s, i) => (i === idx ? e.target.value : s))
                    )
                  }
                  placeholder={`Trust badge #${idx + 1} (e.g. সারা বাংলাদেশে ক্যাশ অন ডেলিভারি)`}
                  className={`${inputClass} text-xs py-1.5`}
                />
                <button
                  type="button"
                  onClick={() => setShippingBarItems((prev) => prev.filter((_, i) => i !== idx))}
                  className="text-xs text-red-600 hover:underline shrink-0"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setShippingBarItems((prev) => [...prev, ""])}
              className={`${btnGhost} text-xs py-1.5 px-3`}
            >
              + Add Trust Badge
            </button>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex justify-end gap-3 pt-4">
        <Link href="/admin/landing-pages" className={btnGhost}>
          Cancel
        </Link>
        <button type="submit" disabled={submitting} className={btnPrimary}>
          {submitting ? "Saving..." : page ? "Save Changes" : "Publish Landing Page"}
        </button>
      </div>
    </form>
  );
}
