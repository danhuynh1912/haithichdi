'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { BotMessageSquare } from 'lucide-react';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';
import { usePathname, useRouter } from '@/i18n/navigation';
import ChatWindow from './chat-window';
import { usePersistedChatMessages } from './chat-storage';

export default function ChatWidget() {
  const t = useTranslations('chat');
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  // State nằm trong sessionStorage nên bấm "Mở rộng" nhảy sang /chatbot vẫn
  // giữ nguyên hội thoại + tin nhắn đang gõ dở (chat-window tự lo phần draft).
  const [messages, setMessages] = usePersistedChatMessages();
  const isMobile = useIsMobile();

  // Trang /chatbot đã là một khung chat toàn màn hình — nổi thêm bong bóng
  // ở góc chỉ gây trùng lặp.
  if (pathname === '/chatbot') return null;

  function handleOpen() {
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
  }

  // "Mở rộng" = sang hẳn trang chat fullscreen
  function handleExpand() {
    setIsOpen(false);
    router.push('/chatbot');
  }

  // bottom offset: on mobile stay above the bottom bar (65px + 8px gap = 20)
  const buttonBottom = isMobile ? 'bottom-20' : 'bottom-6';
  const popupBottom = isMobile ? 'bottom-36' : 'bottom-24';

  return (
    <>
      {/* Floating button — always visible */}
      <motion.button
        key='chat-fab'
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        onClick={isOpen ? handleClose : handleOpen}
        aria-label={isOpen ? t('closeAria') : t('openAria')}
        className={`fixed right-6 z-[9998] h-14 w-14 rounded-full bg-brand text-brand-ink shadow-[var(--shadow-soft)] flex items-center justify-center hover:bg-brand-strong transition-colors ${buttonBottom}`}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <BotMessageSquare size={24} />
        </motion.div>
      </motion.button>

      {/* Popup (small window) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key='chat-popup'
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`fixed right-6 z-[9997] w-80 max-sm:w-[calc(100vw-3rem)] ${popupBottom}`}
            style={{ height: 420 }}
          >
            <ChatWindow
              messages={messages}
              onMessagesChange={setMessages}
              onClose={handleClose}
              onExpand={handleExpand}
              className='h-full w-full'
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
