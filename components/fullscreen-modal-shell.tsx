'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FullscreenModalShellProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  backdropClassName?: string;
  containerClassName?: string;
  contentClassName?: string;
  showCloseButton?: boolean;
  closeAriaLabel?: string;
  closeButtonClassName?: string;
  disableBackdropClose?: boolean;
  contentKey?: string | number;
}

export default function FullscreenModalShell({
  open,
  onClose,
  children,
  backdropClassName,
  containerClassName,
  contentClassName,
  showCloseButton = true,
  closeAriaLabel,
  closeButtonClassName,
  disableBackdropClose = false,
  contentKey,
}: FullscreenModalShellProps) {
  const t = useTranslations('common');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className={cn(
            'fixed inset-0 z-[9999] bg-scrim backdrop-blur-md',
            backdropClassName,
          )}
          onClick={disableBackdropClose ? undefined : onClose}
        >
          <div className={cn('h-full w-full', containerClassName)}>
            <motion.div
              key={contentKey}
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={(event) => event.stopPropagation()}
              className={cn('relative h-full w-full overflow-y-auto', contentClassName)}
            >
              {showCloseButton && (
                <button
                  onClick={onClose}
                  aria-label={closeAriaLabel ?? t('close')}
                  className={cn(
                    'absolute top-4 right-4 z-[110] h-10 w-10 rounded-full border border-line-3 bg-elev-0/70 backdrop-blur-sm text-ink-1 flex items-center justify-center hover:border-brand/70 hover:text-brand transition-colors',
                    closeButtonClassName,
                  )}
                >
                  <X size={18} />
                </button>
              )}
              {children}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
