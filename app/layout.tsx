import { Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import { createRootMetadata } from '@/lib/seo';
import SiteHeader from '@/components/site-header';
import MobileBottomBar from '@/features/mobile/mobile-bottom-bar';
import SiteFooter from '@/components/site-footer';
// Agent/RAG temporarily dropped in the Supabase migration — re-enable when the
// agent backend is reintroduced.
// import ChatWidget from '@/components/agent/chat-widget';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-be-vietnam-pro',
});

export const metadata = createRootMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='vi'>
      <body className={`${beVietnamPro.className} antialiased relative`}>
        {/* <PageTransition /> */}
        <SiteHeader />
        <Providers>
          <div className='pb-[65px] md:pb-0 min-h-screen flex flex-col overflow-x-hidden'>
            <div className='flex-1'>{children}</div>
            <SiteFooter />
          </div>
          <MobileBottomBar />
          {/* <ChatWidget /> */}
        </Providers>
      </body>
    </html>
  );
}
