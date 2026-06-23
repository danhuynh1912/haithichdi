/**
 * Media URL resolution.
 *
 * The database stores an S3 KEY in `*_path` columns (e.g.
 * "locations/images/fansipan.jpg") and an optional external/fallback absolute
 * URL in `*_url` columns. The final URL is the CDN base + path, falling back to
 * the raw url. This is the single place that knows about the CDN domain — swap
 * S3/CloudFront for any other CDN by changing NEXT_PUBLIC_CDN_BASE_URL only.
 */

const CDN_BASE = (process.env.NEXT_PUBLIC_CDN_BASE_URL ?? '').replace(/\/+$/, '');

export function resolveMediaUrl(
  path: string | null | undefined,
  fallbackUrl: string | null | undefined,
): string | null {
  if (path && path.trim()) {
    const key = path.replace(/^\/+/, '');
    return CDN_BASE ? `${CDN_BASE}/${key}` : `/${key}`;
  }
  return fallbackUrl && fallbackUrl.trim() ? fallbackUrl : null;
}

/** Shape returned by RPCs for any media-bearing object. */
export interface RawMedia {
  image_path?: string | null;
  image_url?: string | null;
}

export function resolveImage(obj: RawMedia | null | undefined): string | null {
  if (!obj) return null;
  return resolveMediaUrl(obj.image_path, obj.image_url);
}
