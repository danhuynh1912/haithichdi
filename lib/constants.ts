export const ANIMATION_EASE: [number, number, number, number] = [
  0.261, 0.169, 0, 1.025,
];

export const ANIMATION_EASE_IN: [number, number, number, number] = [
  0.933, 0.047, 0.978, 0.115,
];

/**
 * Intrinsic size to hand `next/image` for the brand mark.
 *
 * NOT the source file's own dimensions: the mark is a 2366px square, and
 * declaring that made Next serve the 3840px candidate and the browser hold a
 * 21 MB decoded bitmap — twice over, since the light and dark marks both
 * ship — to paint a logo CSS then scales to 44px. The largest it is ever
 * drawn at is `md:h-16` (64px), so 256 leaves room for a 4x screen and keeps
 * the bitmap under a third of a megabyte.
 */
export const LOGO_INTRINSIC_PX = 256;
