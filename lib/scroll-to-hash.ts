/**
 * Smooth-scrolls to an in-page section when the target is on the current page.
 *
 * Returns `true` when it handled the click, so a caller can let the link fall
 * through to a normal navigation otherwise — a `/#about-us` pressed from
 * `/tours` has to change page first, and only then does the hash matter.
 *
 * This exists because the page no longer sets `scroll-behavior: smooth` on
 * `html`: that turned every route change into an animation over the full height
 * of the page being left, which on a phone reads as the new page opening
 * halfway down.
 */
export function scrollToHash(id: string): boolean {
  const target = document.getElementById(id);
  if (!target) return false;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const startedAt = window.scrollY;
  target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  window.history.pushState(null, '', `#${id}`);

  // Some environments ignore smooth scrolling entirely — automation profiles
  // and locked-down browsers among them. The default jump was cancelled by the
  // caller, so without this the link would do nothing at all.
  if (!reduceMotion) {
    window.setTimeout(() => {
      if (window.scrollY === startedAt) {
        target.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    }, 250);
  }

  return true;
}
