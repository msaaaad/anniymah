import { randomUUID } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'product-images';

const ALLOWED_TYPES: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private client: SupabaseClient | null = null;

  private getClient(): SupabaseClient {
    if (!this.client) {
      this.client = createClient(process.env.SUPABASE_URL ?? '', process.env.SUPABASE_SERVICE_ROLE_KEY ?? '', {
        auth: { persistSession: false },
      });
    }
    return this.client;
  }

  isAllowedType(mimeType: string): boolean {
    return mimeType in ALLOWED_TYPES;
  }

  async upload(file: { buffer: Buffer; mimetype: string }): Promise<string> {
    const extension = ALLOWED_TYPES[file.mimetype];
    const filename = `${randomUUID()}.${extension}`;

    const { error } = await this.getClient()
      .storage.from(BUCKET)
      .upload(filename, file.buffer, { contentType: file.mimetype, cacheControl: '31536000' });
    if (error) throw new Error(`Upload failed: ${error.message}`);

    const { data } = this.getClient().storage.from(BUCKET).getPublicUrl(filename);
    return data.publicUrl;
  }

  // Best-effort cleanup — deletes an admin-uploaded image once it's no
  // longer referenced. Silently no-ops for empty/external URLs so it's
  // safe to call with any url value.
  async deleteIfOwned(url: string): Promise<void> {
    if (!url) return;
    const marker = `/object/public/${BUCKET}/`;
    const index = url.indexOf(marker);
    if (index === -1) return;
    const path = url.slice(index + marker.length);
    if (!path) return;

    const { error } = await this.getClient().storage.from(BUCKET).remove([path]);
    if (error) {
      this.logger.error(`Failed to delete storage image "${path}": ${error.message}`);
    }
  }
}
