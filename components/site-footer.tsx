'use client';

import { Copy, Facebook, Mail, MapPin, Phone, Ticket } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react';

import { FACEBOOK_URL, HOTLINE, TIKTOK_URL } from '@/lib/contact';


const EMAIL = 'haithichdii@gmail.com';
const ADDRESS = '47 hẻm 8/11/36 Phú Đô, Từ Liêm, Hà Nội';

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
  copyAriaLabel,
  copiedLabel,
  onCopy,
}: {
  field: Exclude<CopyField, null>;
  label: string;
  value: string;
  Icon: ComponentType<{ className?: string }>;
  copiedField: CopyField;
  copyAriaLabel: string;
  copiedLabel: string;
  onCopy: (field: Exclude<CopyField, null>, value: string) => void;
}) {
  return (
    <div className='relative inline-flex items-center gap-2'>
      <Icon className='h-4 w-4 text-brand-soft' />
      <span>
        {label}: {value}
      </span>
      <button
        type='button'
        aria-label={copyAriaLabel}
        onClick={() => onCopy(field, value)}
        className='inline-flex h-6 w-6 items-center justify-center rounded-md border border-line-2 bg-surface text-ink-2 hover:border-brand-line hover:text-ink-1 transition-colors'
      >
        <Copy className='h-3.5 w-3.5' />
      </button>
      {copiedField === field ? (
        <span
          role='status'
          aria-live='polite'
          className='w-max pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 rounded-full border border-success-line bg-success-tint px-2 py-0.5 text-[10px] font-medium text-success-soft'
        >
          {copiedLabel}
        </span>
      ) : null}
    </div>
  );
}

export default function SiteFooter() {
  const t = useTranslations('footer');
  const tCommon = useTranslations('common');
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
      className='relative overflow-hidden border-t border-line bg-gradient-to-b from-elev-2 via-elev-3 to-elev-5 text-ink-1 scroll-mt-28'
    >
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute inset-0 bg-[linear-gradient(180deg,var(--sheen)_0%,transparent_36%)]' />
        <div className='absolute inset-0 bg-[radial-gradient(120%_92%_at_82%_-10%,var(--brand-wash)_0%,transparent_60%)]' />
        <div className='absolute inset-0 bg-[radial-gradient(84%_70%_at_10%_100%,var(--brand-wash-soft)_0%,transparent_62%)]' />
      </div>

      <div className='relative mx-auto grid w-full max-w-[1400px] gap-10 px-4 py-14 sm:px-8 lg:grid-cols-[1.2fr_1fr_1fr]'>
        <section className='space-y-4'>
          <p className='inline-flex items-center gap-2 rounded-full border border-brand-line bg-brand-tint px-4 py-2 text-xs uppercase tracking-[0.2em] text-brand-soft'>
            <Ticket className='h-4 w-4 text-brand-soft' />
            {tCommon('brand')}
          </p>
          <h2 className='text-3xl font-black'>{tCommon('brandFull')}</h2>
          <p className='max-w-xl text-sm leading-relaxed text-ink-3'>
            {t('description')}
          </p>
        </section>

        <section className='space-y-4'>
          <h3 className='text-sm uppercase tracking-[0.2em] text-brand-soft-2'>
            {t('contactHeading')}
          </h3>
          <div className='space-y-3 text-sm text-ink-2'>
            <CopyableContactLine
              field='phone'
              label={t('hotline')}
              value={HOTLINE}
              Icon={Phone}
              copiedField={copiedField}
              copyAriaLabel={tCommon('copyAria', { label: t('hotline') })}
              copiedLabel={tCommon('copied')}
              onCopy={handleCopy}
            />
            <CopyableContactLine
              field='email'
              label={t('email')}
              value={EMAIL}
              Icon={Mail}
              copiedField={copiedField}
              copyAriaLabel={tCommon('copyAria', { label: t('email') })}
              copiedLabel={tCommon('copied')}
              onCopy={handleCopy}
            />
            {/* Plain text, not a copy row: an address is read, not dialled or
                pasted into a mail client like the two above it. */}
            <p className='flex items-start gap-2'>
              <MapPin size={16} className='mt-0.5 shrink-0 text-brand-soft-2' aria-hidden />
              <span>
                <span className='text-ink-3'>{t('address')}: </span>
                {ADDRESS}
              </span>
            </p>
          </div>
        </section>

        <section className='space-y-4'>
          <h3 className='text-sm uppercase tracking-[0.2em] text-brand-soft-2'>
            {t('socialHeading')}
          </h3>
          <div className='space-y-3 text-sm text-ink-2'>
            <a
              href={FACEBOOK_URL}
              target='_blank'
              rel='noopener noreferrer'
              // `flex w-fit`, not `inline-flex`: the parent stacks its children
              // with `space-y-*`, which does nothing to inline-level boxes, so
              // the two links sat on one line.
              className='flex w-fit items-center gap-2 hover:text-brand-soft-2 transition-colors'
            >
              <Facebook className='h-4 w-4 text-brand-soft' />
              {t('facebook')}
            </a>
            <a
              href={TIKTOK_URL}
              target='_blank'
              rel='noopener noreferrer'
              // `flex w-fit`, not `inline-flex`: the parent stacks its children
              // with `space-y-*`, which does nothing to inline-level boxes, so
              // the two links sat on one line.
              className='flex w-fit items-center gap-2 hover:text-brand-soft-2 transition-colors'
            >
              <svg
                aria-hidden='true'
                viewBox='0 0 24 24'
                className='h-4 w-4 text-brand-soft'
                fill='currentColor'
              >
                <path d='M19.59 6.69a4.83 4.83 0 0 0-3.77-1.52h-.67a4.26 4.26 0 0 0-3.18 1.47 4.27 4.27 0 0 0-3.19-1.47h-.67a4.83 4.83 0 0 0-3.77 1.52 4.83 4.83 0 0 0-1.52 3.77v2.89a4.83 4.83 0 0 0 1.52 3.77 4.83 4.83 0 0 0 3.77 1.52h.67a4.27 4.27 0 0 0 3.19-1.47 4.26 4.26 0 0 0 3.18 1.47h.67a4.83 4.83 0 0 0 3.77-1.52 4.83 4.83 0 0 0 1.52-3.77v-2.89a4.83 4.83 0 0 0-1.52-3.77Zm-6.4 8.03a2.63 2.63 0 1 1 0-5.26 2.63 2.63 0 0 1 0 5.26Z' />
              </svg>
              {t('tiktok')}
            </a>
          </div>
        </section>
      </div>

      <div className='relative border-t border-line px-4 py-4 text-center text-xs text-ink-5 sm:px-8'>
        {/* String, not number — ICU would otherwise group it as "2.026". */}
        {t('rights', { year: String(new Date().getFullYear()) })}
      </div>
    </footer>
  );
}
