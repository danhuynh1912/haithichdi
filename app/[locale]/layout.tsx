import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Be_Vietnam_Pro } from 'next/font/google';
import '../globals.css';
import Providers from './providers';
import { createRootMetadata, SITE_NAME, SITE_URL } from '@/lib/seo';
import { routing } from '@/i18n/routing';
import SiteHeader from '@/components/site-header';
import MobileBottomBar from '@/features/mobile/mobile-bottom-bar';
import SiteFooter from '@/components/site-footer';
import ThemeProvider from '@/components/theme-provider';
import { THEME_INIT_SCRIPT } from '@/lib/theme';
import ChatWidget from '@/components/agent/chat-widget';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-be-vietnam-pro',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  return createRootMetadata(locale);
}

// Tells Google who runs the site — the knowledge-panel / logo-in-results
// signal. TravelAgency is the schema.org type for a tour operator; the social
// profiles let Google tie the site to the accounts it already knows.
const ORG_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  name: SITE_NAME,
  url: SITE_URL,
  logo: new URL('/haithichdi-logo-red.png', SITE_URL).toString(),
  sameAs: [
    'https://www.facebook.com/haithichdi',
    'https://www.tiktok.com/@haithichdii',
  ],
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    // The theme script below rewrites the class on <html> before hydration.
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={`${beVietnamPro.className} antialiased relative`}>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }}
        />
        <NextIntlClientProvider>
          <ThemeProvider>
            {/* <PageTransition /> */}
            <SiteHeader />
            <Providers>
              <div className='pb-[65px] md:pb-0 min-h-screen flex flex-col overflow-x-hidden'>
                <div className='flex-1'>{children}</div>
                <SiteFooter />
              </div>
              <MobileBottomBar />
              <ChatWidget />
            </Providers>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
