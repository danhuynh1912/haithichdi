import { Check, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

/**
 * What the price does and does not cover, side by side.
 *
 * This lives outside the route write-up on purpose. It is the question a reader
 * asks with their eyes already on the price, so it has to sit next to the price
 * and be scannable — not be a paragraph two thousand words into a description.
 *
 * The same block serves a route page and a departure page: the package is a
 * property of the route, so a tour shows its route's lists unchanged.
 */
export function PriceInclusions({
  includes,
  excludes,
  className,
}: {
  includes: string[];
  excludes: string[];
  className?: string;
}) {
  const t = useTranslations('priceInclusions');

  // A route nobody has filled in yet shows nothing at all rather than two empty
  // boxes claiming the price covers nothing.
  if (!includes.length && !excludes.length) return null;

  return (
    <section className={cn('grid gap-4 md:grid-cols-2', className)}>
      {includes.length > 0 && (
        <Column
          title={t('includedHeading')}
          items={includes}
          icon={<Check size={13} strokeWidth={3} />}
          tone='included'
        />
      )}
      {excludes.length > 0 && (
        <Column
          title={t('excludedHeading')}
          items={excludes}
          icon={<X size={13} strokeWidth={3} />}
          tone='excluded'
        />
      )}
    </section>
  );
}

function Column({
  title,
  items,
  icon,
  tone,
}: {
  title: string;
  items: string[];
  icon: React.ReactNode;
  tone: 'included' | 'excluded';
}) {
  const included = tone === 'included';

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 md:p-5',
        included ? 'border-success-line bg-success-tint' : 'border-line bg-surface',
      )}
    >
      <h3
        className={cn(
          'text-[11px] font-black uppercase tracking-[0.12em]',
          included ? 'text-success-soft' : 'text-ink-4',
        )}
      >
        {title}
      </h3>

      <ul className='mt-3 flex flex-col gap-2.5'>
        {items.map((item, index) => (
          // The text is the identity here — these lists are short, hand-written,
          // and have no id of their own. Duplicate lines would be a data error.
          <li key={`${index}-${item}`} className='flex items-start gap-2.5 text-sm leading-relaxed'>
            <span
              className={cn(
                'mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full',
                included
                  ? 'bg-success text-white'
                  : 'bg-surface-3 text-ink-4',
              )}
              aria-hidden
            >
              {icon}
            </span>
            <span className={included ? 'text-ink-2' : 'text-ink-3'}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
