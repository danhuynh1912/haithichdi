'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const DURATION = 340;
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

const MARGIN = 32;
const MAX_WIDTH = 560;

type Geometry = Pick<DOMRect, 'top' | 'left' | 'width' | 'height'>;

const MODAL_PROPS = ['position', 'z-index', 'top', 'left', 'width', 'height', 'transform', 'overflow'];

/**
 * The column this form sits in is `lg:sticky`, and a sticky element always
 * opens a stacking context. That traps the modal's z-index inside it: however
 * high it goes, it is only competing with its siblings, while the context
 * itself sits at `auto` and loses to the site header at 1000. Lifting the
 * whole context is what actually puts the modal in front.
 */
function setHostLayer(el: HTMLElement, raised: boolean) {
  const host = el.parentElement;
  if (!host) return;
  if (raised) host.style.zIndex = '9999';
  else host.style.removeProperty('z-index');
}

/**
 * The resting shape of the modal, in CSS units rather than measured pixels.
 *
 * Every value here is relative to the viewport, so the modal re-centres and
 * re-sizes itself on any window, orientation or zoom change with no listener
 * watching for it. Pixels enter only in the keyframes below, and only for the
 * length of the animation.
 */
function applyModalStyle(el: HTMLElement) {
  Object.assign(el.style, {
    position: 'fixed',
    zIndex: '9999',
    top: `${MARGIN}px`,
    left: '50%',
    transform: 'translateX(-50%)',
    width: `min(${MAX_WIDTH}px, calc(100vw - ${MARGIN * 2}px))`,
    height: `calc(100dvh - ${MARGIN * 2}px)`,
    // The card inside scrolls its own field list; letting the shell scroll too
    // would put a second scrollbar around the heading and the submit button.
    overflow: 'hidden',
  });
}

function clearModalStyle(el: HTMLElement) {
  for (const prop of MODAL_PROPS) el.style.removeProperty(prop);
}

/**
 * Interpolating between two measured rectangles needs plain pixels, so the
 * centring transform is switched off for the duration — otherwise it would
 * pull the element another half-width left on top of the animated position.
 * Both ends agree with the CSS above, so releasing the animation afterwards
 * changes nothing on screen.
 */
function keyframes(from: Geometry, to: Geometry): Keyframe[] {
  return [
    { top: `${from.top}px`, left: `${from.left}px`, width: `${from.width}px`, height: `${from.height}px`, transform: 'none' },
    { top: `${to.top}px`, left: `${to.left}px`, width: `${to.width}px`, height: `${to.height}px`, transform: 'none' },
  ];
}

/**
 * Grows the booking form into a modal and back, without it ever leaving the
 * document.
 *
 * Two things this deliberately does not do. It does not portal: the same DOM
 * nodes stay in the same place in the tree and only their geometry changes,
 * so everything already typed survives — the inputs are uncontrolled, and a
 * portal would rebuild them empty on every open and close. And it does not
 * cut from one position to the other: it measures where the form is, measures
 * where it is going, and interpolates between the two, so the expansion reads
 * as one continuous movement rather than a jump followed by a fade.
 */
export function BookingFormModal({
  open,
  onClose,
  onFocusCapture,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onFocusCapture: () => void;
  children: ReactNode;
}) {
  const t = useTranslations('common');
  const formRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const animation = useRef<Animation | null>(null);
  const isFirstRun = useRef(true);

  const animate = useCallback((el: HTMLElement, from: Geometry, to: Geometry) => {
    animation.current?.cancel();
    const next = el.animate(keyframes(from, to), {
      duration: DURATION,
      easing: EASING,
      // Needed so the first frame reads as the old geometry rather than the
      // new one. It has to be released on finish, though: a filling animation
      // keeps overriding the element forever, and a later resize would move
      // the inline styles while the form stayed pinned to a stale position.
      fill: 'both',
    });
    animation.current = next;
    return next;
  }, []);

  useLayoutEffect(() => {
    const el = formRef.current;
    const spacer = spacerRef.current;
    if (!el || !spacer) return;

    // Nothing to animate on the first render — the form starts in the column.
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    if (open) {
      const from = el.getBoundingClientRect();
      // The column would otherwise collapse the moment the form leaves the
      // flow, shifting the whole page behind the backdrop.
      spacer.style.height = `${from.height}px`;
      setHostLayer(el, true);
      applyModalStyle(el);
      const opening = animate(el, from, el.getBoundingClientRect());
      // The inline styles already hold the end state, so dropping the
      // animation changes nothing visually and hands control back.
      opening.onfinish = () => {
        opening.cancel();
        animation.current = null;
      };
      return;
    }

    // Closing: measure the modal, drop back into the column to find out where
    // that is, then put it back and play the same movement in reverse.
    const from = el.getBoundingClientRect();
    clearModalStyle(el);
    spacer.style.height = '';
    const to = el.getBoundingClientRect();
    applyModalStyle(el);

    const running = animate(el, from, to);
    running.onfinish = () => {
      running.cancel();
      clearModalStyle(el);
      // Only now — the form has to stay above the header for the whole way back.
      setHostLayer(el, false);
      animation.current = null;
    };
  }, [open, animate]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    // The page behind would otherwise scroll under the backdrop.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <>
      <div ref={spacerRef} aria-hidden />

      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-[9998] bg-scrim backdrop-blur-md',
          'transition-opacity ease-out motion-reduce:transition-none',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        style={{ transitionDuration: `${DURATION}ms` }}
      />

      <div
        ref={formRef}
        onFocusCapture={onFocusCapture}
        role={open ? 'dialog' : undefined}
        aria-modal={open || undefined}
        className='relative'
      >
        <button
          type='button'
          onClick={onClose}
          aria-label={t('close')}
          tabIndex={open ? 0 : -1}
          className={cn(
            'absolute top-4 right-4 z-10 h-10 w-10 rounded-full border border-line-3',
            'bg-elev-0/70 backdrop-blur-sm text-ink-1 flex items-center justify-center',
            'hover:border-brand/70 hover:text-brand',
            'transition-opacity ease-out motion-reduce:transition-none',
            open ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
          style={{ transitionDuration: `${DURATION}ms` }}
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </>
  );
}
