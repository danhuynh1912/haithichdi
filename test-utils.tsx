import React, { type ReactElement } from 'react';
import {
  render as rtlRender,
  type RenderOptions,
  type RenderResult,
} from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { formats, TIME_ZONE } from '@/i18n/formats';
import viMessages from './messages/vi.json';
import enMessages from './messages/en.json';

type Locale = 'vi' | 'en';

export const MESSAGES: Record<Locale, typeof viMessages> = {
  vi: viMessages,
  en: enMessages as typeof viMessages,
};

/**
 * Testing Library's `render` with the real message catalogue wired up, so
 * assertions read against the copy we actually ship rather than a stub.
 * Defaults to `vi`; pass `{ locale: 'en' }` to assert the English copy.
 *
 * Deliberately not named `render` and not re-exporting `@testing-library/react`
 * — an `export *` alongside a local `render` is ambiguous enough that the
 * wrapper silently went missing.
 */
export function renderIntl(
  ui: ReactElement,
  {
    locale = 'vi',
    ...options
  }: Omit<RenderOptions, 'wrapper'> & { locale?: Locale } = {},
): RenderResult {
  return rtlRender(ui, {
    ...options,
    wrapper: ({ children }) => (
      <NextIntlClientProvider
        locale={locale}
        messages={MESSAGES[locale]}
        formats={formats}
        timeZone={TIME_ZONE}
      >
        {children}
      </NextIntlClientProvider>
    ),
  });
}
