import { defineRouting } from 'next-intl/routing';

/**
 * Single source of truth for everything locale-related.
 *
 * `localePrefix: 'as-needed'` keeps the Vietnamese URLs exactly as they were
 * (`/tours`) and prefixes only the secondary locales (`/en/tours`), so no
 * existing link or indexed URL breaks.
 *
 * `localeDetection: false` is deliberate: with `as-needed`, auto-detection
 * would make `/tours` serve Vietnamese or English depending on the visitor's
 * `Accept-Language` header, so the same URL would self-canonicalise to two
 * different pages and could not be cached without varying on the header.
 * Pinning it means every URL maps to exactly one language; the switcher is how
 * readers change locale. Flip this to `true` if auto-detecting on arrival
 * matters more than deterministic URLs.
 */
export const routing = defineRouting({
  locales: ['vi', 'en'],
  defaultLocale: 'vi',
  localePrefix: 'as-needed',
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];

/** BCP-47 tags used by `Intl.*` formatters and `og:locale`. */
export const LOCALE_TAG: Record<Locale, string> = {
  vi: 'vi-VN',
  en: 'en-US',
};

export const OG_LOCALE: Record<Locale, string> = {
  vi: 'vi_VN',
  en: 'en_US',
};

/** Human label shown in the language switcher. */
export const LOCALE_LABEL: Record<Locale, string> = {
  vi: 'VI',
  en: 'EN',
};

export function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

/**
 * Turns an unprefixed app path into the public URL for `locale`.
 * Mirrors `localePrefix: 'as-needed'` — used by metadata/sitemap, which build
 * absolute URLs outside of the navigation APIs.
 */
export function localizedPath(pathname: string, locale: Locale): string {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (locale === routing.defaultLocale) return normalized;
  return normalized === '/' ? `/${locale}` : `/${locale}${normalized}`;
}
