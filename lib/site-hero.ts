/**
 * Lets a screen tell <SiteHeader /> that it opens on full-bleed media.
 *
 * The header is rendered by the layout, above the routed screen, so it cannot
 * ask its children anything. A screen registers its hero element here; while
 * the header overlaps that element it pins itself to the dark palette, because
 * light-theme copy would be unreadable on the footage underneath.
 */

type Listener = () => void;

let heroElement: HTMLElement | null = null;
const listeners = new Set<Listener>();

export function getSiteHeroElement() {
  return heroElement;
}

export function setSiteHeroElement(element: HTMLElement | null) {
  if (heroElement === element) return;
  heroElement = element;
  for (const listener of listeners) listener();
}

export function subscribeSiteHero(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
