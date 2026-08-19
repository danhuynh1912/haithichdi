'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import ChatWindow from '@/components/agent/chat-window';
import { usePersistedChatMessages } from '@/components/agent/chat-storage';

/**
 * /chatbot — chat fullscreen thật sự: phủ kín viewport, đè lên header/footer
 * của layout (z-[1000]), chỉ còn logo góc trái để về trang chủ. Nút X trong
 * khung chat cũng về trang chủ. Widget nổi tự ẩn trên route này.
 */
export default function ChatbotRouteClient() {
  const router = useRouter();
  const t = useTranslations('common');
  // Cùng sessionStorage với widget nổi — mở rộng từ widget là tiếp nối luôn
  const [messages, setMessages] = usePersistedChatMessages();

  return (
    <div className='fixed inset-0 z-[1100] bg-elev-1 flex flex-col'>
      {/* Thanh trên: chỉ logo — bấm về home */}
      <div className='flex items-center px-4 py-3 md:px-6 shrink-0'>
        <Link href='/' aria-label={t('brand')} className='inline-flex items-center'>
          {/* Hai bản logo để light/dark swap thuần CSS, cùng idiom site-header */}
          <Image
            src='/haithichdi-logo-red.png'
            alt={t('brand')}
            width={2366}
            height={2366}
            priority
            className='h-10 md:h-12 w-auto hover:opacity-85 transition-opacity dark:hidden'
          />
          <Image
            src='/haithichdi-logo-white.png'
            alt=''
            aria-hidden='true'
            width={2366}
            height={2366}
            priority
            className='h-10 md:h-12 w-auto hover:opacity-85 transition-opacity hidden dark:block'
          />
        </Link>
      </div>

      {/* Khung chat chiếm phần còn lại; max-w-3xl tự căn giữa ở desktop */}
      <div className='flex-1 min-h-0 flex md:px-6 md:pb-4'>
        <ChatWindow
          messages={messages}
          onMessagesChange={setMessages}
          onClose={() => router.push('/')}
          isFullscreen
          className='w-full'
        />
      </div>
    </div>
  );
}
