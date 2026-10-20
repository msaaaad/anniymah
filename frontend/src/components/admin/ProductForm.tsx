"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client";
import { errorMessages } from "@/lib/api-error";
import type { Category, Product, ProductPayload } from "@/lib/api-types";
import { slugify } from "@/lib/slug";
import { MultiImageUploader } from "@/components/admin/MultiImageUploader";
import { btnGhost, btnPrimary, cardClass, inputClass, labelClass } from "@/components/admin/styles";

interface ProductFormProps {
  categories: Category[];
  product?: Product;
}

function toInt(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [regularPrice, setRegularPrice] = useState(String(product?.regularPrice ?? 0));
  const [freeDelivery, setFreeDelivery] = useState(product?.freeDelivery ?? true);
  const [chargeInside, setChargeInside] = useState(String(product?.deliveryChargeInsideDhaka ?? 0));
  const [chargeOutside, setChargeOutside] = useState(String(product?.deliveryChargeOutsideDhaka ?? 0));
  const [active, setActive] = useState(product?.active ?? true);
  const [images, setImages] = useState<string[]>(product?.images.map((image) => image.url) ?? []);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrors([]);

    const payload: ProductPayload = {
      name: name.trim(),
      slug,
      categoryId: categoryId || null,
      description,
      price: toInt(price),
      regularPrice: toInt(regularPrice),
      freeDelivery,
      deliveryChargeInsideDhaka: toInt(chargeInside),
      deliveryChargeOutsideDhaka: toInt(chargeOutside),
      active,
      images,
    };

    try {
      if (product) {
        await apiJson(`/products/${product.id}`, "PATCH", payload);
        toast.success("Product updated");
      } else {
        await apiJson("/products", "POST", payload);
        toast.success("Product created");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setErrors(errorMessages(err));
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold">{product ? "Edit product" : "New product"}</h1>
        <Link href="/admin/products" className={btnGhost}>
          Cancel
        </Link>
      </div>

      {errors.length > 0 && (
        <ul role="alert" className="list-disc rounded-[10px] bg-danger-tint py-3 pl-8 pr-4 text-sm text-danger-dark">
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      <section className={`${cardClass} grid gap-4 p-5 sm:grid-cols-2`}>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="product-name" className={labelClass}>
            Name
          </label>
          <input
            id="product-name"
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="product-slug" className={labelClass}>
            Slug
          </label>
          <input
            id="product-slug"
            required
            value={slug}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            title="Lowercase letters, numbers and single hyphens"
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="product-category" className={labelClass}>
            Category
          </label>
          <select
            id="product-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={inputClass}
          >
            <option value="">Uncategorized</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2.5 self-end pb-2.5 text-sm">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 accent-sage"
          />
          Active (visible on the storefront)
        </label>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="product-description" className={labelClass}>
            Description
          </label>
          <textarea
            id="product-description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass}
          />
        </div>
      </section>

      <section className={`${cardClass} grid gap-4 p-5 sm:grid-cols-2`}>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="product-price" className={labelClass}>
            Price (৳)
          </label>
          <input
            id="product-price"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="product-regular-price" className={labelClass}>
            Regular price (৳) — shown crossed out when higher than price
          </label>
          <input
            id="product-regular-price"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={regularPrice}
            onChange={(e) => setRegularPrice(e.target.value)}
            className={inputClass}
          />
        </div>
        <label className="flex items-center gap-2.5 text-sm sm:col-span-2">
          <input
            type="checkbox"
            checked={freeDelivery}
            onChange={(e) => setFreeDelivery(e.target.checked)}
            className="h-4 w-4 accent-sage"
          />
          Free delivery
        </label>
        {!freeDelivery && (
          <>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="charge-inside" className={labelClass}>
                Delivery charge inside Dhaka (৳)
              </label>
              <input
                id="charge-inside"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={chargeInside}
                onChange={(e) => setChargeInside(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="charge-outside" className={labelClass}>
                Delivery charge outside Dhaka (৳)
              </label>
              <input
                id="charge-outside"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={chargeOutside}
                onChange={(e) => setChargeOutside(e.target.value)}
                className={inputClass}
              />
            </div>
          </>
        )}
      </section>

      <section className={`${cardClass} p-5`}>
        <MultiImageUploader urls={images} onChange={setImages} />
      </section>

      <div className="flex justify-end gap-3">
        <Link href="/admin/products" className={btnGhost}>
          Cancel
        </Link>
        <button type="submit" disabled={submitting} className={btnPrimary}>
          {submitting ? "Saving..." : product ? "Save changes" : "Create product"}
        </button>
      </div>
    </form>
  );
}
