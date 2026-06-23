'use client';

import { Copy, Facebook, Mail, Phone, Ticket } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react';

const HOTLINE = '0336594797';
const EMAIL = 'quanghaibh98@gmail.com';

type CopyField = 'phone' | 'email' | null;

function fallbackCopy(text: string) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  textArea.style.pointerEvents = 'none';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
}

function CopyableContactLine({
  field,
  label,
  value,
  Icon,
  copiedField,
  onCopy,
}: {
  field: Exclude<CopyField, null>;
  label: string;
  value: string;
  Icon: ComponentType<{ className?: string }>;
  copiedField: CopyField;
  onCopy: (field: Exclude<CopyField, null>, value: string) => void;
}) {
  return (
    <div className='relative inline-flex items-center gap-2'>
      <Icon className='h-4 w-4 text-red-300' />
      <span>
        {label}: {value}
      </span>
      <button
        type='button'
        aria-label={`Copy ${label}`}
        onClick={() => onCopy(field, value)}
        className='inline-flex h-6 w-6 items-center justify-center rounded-md border border-white/15 bg-white/5 text-neutral-200 hover:border-red-400/50 hover:text-white transition-colors'
      >
        <Copy className='h-3.5 w-3.5' />
      </button>
      {copiedField === field ? (
        <span
          role='status'
          aria-live='polite'
          className='w-max pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 rounded-full border border-emerald-300/40 bg-emerald-400/12 px-2 py-0.5 text-[10px] font-medium text-emerald-200'
        >
          Đã copy
        </span>
      ) : null}
    </div>
  );
}

export default function SiteFooter() {
  const [copiedField, setCopiedField] = useState<CopyField>(null);
  const copyTimeoutRef = useRef<number | null>(null);

  const handleCopy = useCallback(
    async (field: Exclude<CopyField, null>, value: string) => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(value);
        } else {
          fallbackCopy(value);
        }
      } catch {
        fallbackCopy(value);
      }

      setCopiedField(field);
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = window.setTimeout(() => {
        setCopiedField(null);
      }, 1300);
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  return (
    <footer
      id='site-footer'
      className='relative overflow-hidden border-t border-white/10 bg-gradient-to-b from-[#111111] via-[#141414] to-[#1a1a1a] text-white scroll-mt-28'
    >
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.015)_0%,rgba(255,255,255,0)_36%)]' />
        <div className='absolute inset-0 bg-[radial-gradient(120%_92%_at_82%_-10%,rgba(208,6,0,0.12)_0%,transparent_60%)]' />
        <div className='absolute inset-0 bg-[radial-gradient(84%_70%_at_10%_100%,rgba(208,6,0,0.07)_0%,transparent_62%)]' />
      </div>

      <div className='relative mx-auto grid w-full max-w-[1400px] gap-10 px-4 py-14 sm:px-8 lg:grid-cols-[1.2fr_1fr_1fr]'>
        <section className='space-y-4'>
          <p className='inline-flex items-center gap-2 rounded-full border border-red-400/35 bg-red-500/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-red-100'>
            <Ticket className='h-4 w-4 text-red-300' />
            Hải Thích Đi
          </p>
          <h2 className='text-3xl font-black'>Hải Thích Đi Travel</h2>
          <p className='max-w-xl text-sm leading-relaxed text-neutral-300'>
            Chúng tôi tạo ra những hành trình trekking thật, nơi bạn vừa chinh phục giới hạn
            của bản thân, vừa kết nối cộng đồng và để lại giá trị tích cực trên từng cung đường.
          </p>
        </section>

        <section className='space-y-4'>
          <h3 className='text-sm uppercase tracking-[0.2em] text-red-200'>Thông tin liên hệ</h3>
          <div className='space-y-3 text-sm text-neutral-200'>
            <CopyableContactLine
              field='phone'
              label='Hotline'
              value={HOTLINE}
              Icon={Phone}
              copiedField={copiedField}
              onCopy={handleCopy}
            />
            <CopyableContactLine
              field='email'
              label='Email'
              value={EMAIL}
              Icon={Mail}
              copiedField={copiedField}
              onCopy={handleCopy}
            />
          </div>
        </section>

        <section className='space-y-4'>
          <h3 className='text-sm uppercase tracking-[0.2em] text-red-200'>Mạng xã hội</h3>
          <div className='space-y-3 text-sm text-neutral-200'>
            <a
              href='https://www.facebook.com/haithichdi'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 hover:text-red-200 transition-colors'
            >
              <Facebook className='h-4 w-4 text-red-300' />
              Facebook: Hải Thích Đi
            </a>
            <a
              href='https://www.tiktok.com/@haithichdii'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 hover:text-red-200 transition-colors'
            >
              <svg
                aria-hidden='true'
                viewBox='0 0 24 24'
                className='h-4 w-4 text-red-300'
                fill='currentColor'
              >
                <path d='M19.59 6.69a4.83 4.83 0 0 0-3.77-1.52h-.67a4.26 4.26 0 0 0-3.18 1.47 4.27 4.27 0 0 0-3.19-1.47h-.67a4.83 4.83 0 0 0-3.77 1.52 4.83 4.83 0 0 0-1.52 3.77v2.89a4.83 4.83 0 0 0 1.52 3.77 4.83 4.83 0 0 0 3.77 1.52h.67a4.27 4.27 0 0 0 3.19-1.47 4.26 4.26 0 0 0 3.18 1.47h.67a4.83 4.83 0 0 0 3.77-1.52 4.83 4.83 0 0 0 1.52-3.77v-2.89a4.83 4.83 0 0 0-1.52-3.77Zm-6.4 8.03a2.63 2.63 0 1 1 0-5.26 2.63 2.63 0 0 1 0 5.26Z' />
              </svg>
              TikTok: Hải Thích Đi
            </a>
          </div>
        </section>
      </div>

      <div className='relative border-t border-white/10 px-4 py-4 text-center text-xs text-neutral-500 sm:px-8'>
        © {new Date().getFullYear()} Hải Thích Đi Travel. All rights reserved.
      </div>
    </footer>
  );
}
