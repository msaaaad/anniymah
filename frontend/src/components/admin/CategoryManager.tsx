"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client";
import { errorMessages } from "@/lib/api-error";
import type { Category } from "@/lib/api-types";
import { slugify } from "@/lib/slug";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Modal } from "@/components/admin/Modal";
import { btnDangerOutline, btnGhost, btnLink, btnPrimary, cardClass, inputClass, labelClass } from "@/components/admin/styles";

type Editing = { mode: "create" } | { mode: "edit"; category: Category } | null;

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Editing>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [busy, setBusy] = useState(false);

  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);
    try {
      await apiJson(`/categories/${deleting.id}`, "DELETE");
      toast.success(`"${deleting.name}" moved to trash`);
      setDeleting(null);
      router.refresh();
    } catch (err) {
      toast.error(errorMessages(err).join(", "));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold">Categories</h1>
        <div className="flex gap-3">
          <Link href="/admin/categories/trash" className={btnGhost}>
            Trash
          </Link>
          <button type="button" onClick={() => setEditing({ mode: "create" })} className={btnPrimary}>
            New category
          </button>
        </div>
      </div>

      {categories.length === 0 ? (
        <p className={`${cardClass} mt-6 p-8 text-center text-sm text-muted`}>
          No categories yet. Create one to start organising products.
        </p>
      ) : (
        <div className={`${cardClass} mt-6 overflow-x-auto`}>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-[13px] text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Name
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Slug
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{category.name}</td>
                  <td className="px-4 py-3 text-muted">{category.slug}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-4">
                      <button type="button" className={btnLink} onClick={() => setEditing({ mode: "edit", category })}>
                        Edit
                      </button>
                      <button type="button" className={btnDangerOutline} onClick={() => setDeleting(category)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={editing !== null}
        title={editing?.mode === "edit" ? "Edit category" : "New category"}
        onClose={() => setEditing(null)}
      >
        {editing && (
          <CategoryForm
            key={editing.mode === "edit" ? editing.category.id : "new"}
            category={editing.mode === "edit" ? editing.category : undefined}
            onCancel={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              router.refresh();
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Move to trash?"
        message={
          <>
            <strong>{deleting?.name}</strong> will be moved to the trash. You can restore it later.
          </>
        }
        confirmLabel="Move to trash"
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}

interface CategoryFormProps {
  category?: Category;
  onCancel: () => void;
  onSaved: () => void;
}

function CategoryForm({ category, onCancel, onSaved }: CategoryFormProps) {
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(category));
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
    try {
      if (category) {
        await apiJson(`/categories/${category.id}`, "PATCH", { name: name.trim(), slug });
        toast.success("Category updated");
      } else {
        await apiJson("/categories", "POST", { name: name.trim(), slug });
        toast.success("Category created");
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
        <label htmlFor="category-name" className={labelClass}>
          Name
        </label>
        <input
          id="category-name"
          required
          autoFocus
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="category-slug" className={labelClass}>
          Slug
        </label>
        <input
          id="category-slug"
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

      {errors.length > 0 && (
        <ul role="alert" className="list-disc pl-5 text-sm text-danger-dark">
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      <div className="mt-2 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className={btnGhost}>
          Cancel
        </button>
        <button type="submit" disabled={submitting} className={btnPrimary}>
          {submitting ? "Saving..." : category ? "Save changes" : "Create category"}
        </button>
      </div>
    </form>
  );
}
