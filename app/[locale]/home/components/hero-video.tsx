'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Hero background clips, played back to back and then from the top again.
 *
 * A single <video> with several <source> children would not do this: the
 * browser picks the first source it can play and ignores the rest, they are
 * fallbacks for one clip, not a playlist. So each clip gets its own element and
 * `ended` hands over to the next.
 */
const CLIPS = [
  { src: '/vids/0820.mp4', type: 'video/mp4' },
  { src: '/vids/haithichdi-homepage.webm', type: 'video/webm' },
];

export function HeroVideo({ poster, className }: { poster: string; className?: string }) {
  const [active, setActive] = useState(0);
  // The clips are tens of megabytes. Only the first one is worth fetching
  // during load; the rest are warmed once the hero is actually playing, which
  // is early enough to have them ready before the handover.
  const [warmed, setWarmed] = useState(false);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);

  /** Hand over to the next clip — also on error, so one bad file cannot freeze
   *  the hero on a still frame. */
  const advance = () => {
    const next = (active + 1) % CLIPS.length;
    const el = videos.current[next];
    if (el) {
      el.currentTime = 0;
      void el.play().catch(() => {});
    }
    setActive(next);
  };

  return (
    <div className={cn('absolute inset-0', className)}>
      {CLIPS.map((clip, index) => (
        <video
          key={clip.src}
          ref={(el) => {
            videos.current[index] = el;
          }}
          autoPlay={index === 0}
          muted
          playsInline
          preload={index === 0 || warmed ? 'auto' : 'metadata'}
          poster={index === 0 ? poster : undefined}
          onPlaying={index === 0 ? () => setWarmed(true) : undefined}
          onEnded={advance}
          onError={advance}
          aria-hidden='true'
          // A hard cut, not a crossfade: mid-fade both clips are half visible
          // and the hero reads as a double exposure.
          className={cn(
            'absolute inset-0 h-full w-full object-cover',
            index === active ? 'opacity-100' : 'opacity-0',
          )}
        >
          <source src={clip.src} type={clip.type} />
        </video>
      ))}
    </div>
  );
}
