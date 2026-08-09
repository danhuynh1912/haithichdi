'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { BotMessageSquare } from 'lucide-react';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';
import FullscreenModalShell from '@/components/fullscreen-modal-shell';
import ChatWindow, { type Message } from './chat-window';

export default function ChatWidget() {
  const t = useTranslations('chat');
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const isMobile = useIsMobile();

  function handleOpen() {
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
    setIsFullscreen(false);
  }

  function handleExpand() {
    setIsFullscreen(true);
  }

  function handleCollapse() {
    setIsFullscreen(false);
  }

  // bottom offset: on mobile stay above the bottom bar (65px + 8px gap = 20)
  const buttonBottom = isMobile ? 'bottom-20' : 'bottom-6';
  const popupBottom = isMobile ? 'bottom-36' : 'bottom-24';

  return (
    <>
      {/* Floating button — always visible */}
      <AnimatePresence>
        {!isFullscreen && (
          <motion.button
            key='chat-fab'
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
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
        )}
      </AnimatePresence>

      {/* Popup (small window) */}
      <AnimatePresence>
        {isOpen && !isFullscreen && (
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

      {/* Full-screen mode */}
      <FullscreenModalShell
        open={isOpen && isFullscreen}
        onClose={handleClose}
        showCloseButton={false}
        contentClassName='flex items-stretch justify-center'
      >
        <ChatWindow
          messages={messages}
          onMessagesChange={setMessages}
          onClose={handleClose}
          onCollapse={handleCollapse}
          isFullscreen
          className='w-full'
        />
      </FullscreenModalShell>
    </>
  );
}
