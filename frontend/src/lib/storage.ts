import { getSupabaseAdmin } from "@/lib/supabase";

const BUCKET = "landing-images";

// Best-effort cleanup — deletes an admin-uploaded image from Storage once
// it's no longer referenced by any landing page. Silently no-ops for
// empty/external URLs so it's safe to call with any imageUrl value.
export async function deleteStorageImageIfOwned(url: string): Promise<void> {
  if (!url) return;
  const marker = `/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return;
  const path = url.slice(index + marker.length);
  if (!path) return;

  const { error } = await getSupabaseAdmin().storage.from(BUCKET).remove([path]);
  if (error) {
    console.error(`Failed to delete storage image "${path}":`, error.message);
  }
}
