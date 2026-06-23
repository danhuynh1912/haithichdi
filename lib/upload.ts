/**
 * S3 media upload via Supabase Edge Function presigned URL.
 *
 * Usage (in admin components):
 *   const key = await uploadMedia(file, 'locations/images');
 *   // key = "locations/images/1718000000000-photo.jpg"
 *   // store key in the DB; resolveMediaUrl(key, null) gets the CDN URL
 */

import { supabase } from '@/lib/supabase';

export type MediaPrefix =
  | 'locations/images'
  | 'locations/quotations'
  | 'tours/images'
  | 'profiles/avatars';

/**
 * Upload a file to S3 via presigned URL.
 * Requires an authenticated Supabase session (admin/leader).
 * Returns the S3 key stored in the DB.
 */
export async function uploadMedia(
  file: File,
  prefix: MediaPrefix,
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'bin';
  const key = `${prefix}/${Date.now()}-${sanitizeFilename(file.name, ext)}`;

  // 1. Get presigned PUT URL from the Edge Function
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const fnUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/presign-upload`;
  const presignRes = await fetch(fnUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ key, contentType: file.type }),
  });

  if (!presignRes.ok) {
    const err = await presignRes.json().catch(() => ({}));
    throw new Error(err.error ?? `Presign failed (${presignRes.status})`);
  }

  const { uploadUrl } = await presignRes.json() as { uploadUrl: string; key: string };

  // 2. PUT file directly to S3 (no server middleman, no size limits from Supabase)
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error(`S3 upload failed (${uploadRes.status})`);
  }

  return key;
}

/** Progress-aware variant for large files. */
export function uploadMediaWithProgress(
  file: File,
  prefix: MediaPrefix,
  onProgress: (percent: number) => void,
): { promise: Promise<string>; abort: () => void } {
  const controller = new AbortController();

  const promise = (async () => {
    const ext = file.name.split('.').pop() ?? 'bin';
    const key = `${prefix}/${Date.now()}-${sanitizeFilename(file.name, ext)}`;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const fnUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/presign-upload`;
    const presignRes = await fetch(fnUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ key, contentType: file.type }),
      signal: controller.signal,
    });

    if (!presignRes.ok) {
      const err = await presignRes.json().catch(() => ({}));
      throw new Error(err.error ?? `Presign failed (${presignRes.status})`);
    }

    const { uploadUrl } = await presignRes.json() as { uploadUrl: string };

    // XMLHttpRequest for progress tracking (fetch doesn't expose upload progress)
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      controller.signal.addEventListener('abort', () => xhr.abort());

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`S3 upload failed (${xhr.status})`));
      };
      xhr.onerror = () => reject(new Error('S3 upload network error'));
      xhr.onabort = () => reject(new Error('Upload cancelled'));

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });

    onProgress(100);
    return key;
  })();

  return { promise, abort: () => controller.abort() };
}

function sanitizeFilename(name: string, ext: string): string {
  const base = name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
  return `${base}.${ext}`;
}
