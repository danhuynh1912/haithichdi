import type { formats } from '@/i18n/formats';
import type { routing } from '@/i18n/routing';
import type messages from './messages/vi.json';

/**
 * Makes `useTranslations`/`getTranslations` autocomplete and type-check every
 * key against the Vietnamese catalogue — vi.json is the reference catalogue,
 * so a key missing from en.json is caught by `npm run i18n:check`.
 */
declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
    Formats: typeof formats;
  }
}
