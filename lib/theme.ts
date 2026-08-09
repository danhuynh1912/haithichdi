export const THEMES = ['light', 'dark'] as const;

export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = 'light';

export const THEME_STORAGE_KEY = 'haithichdi-theme';

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

/**
 * Reflects the theme onto <html>. Tailwind's `dark` variant keys off the class;
 * `data-theme` is there so non-Tailwind CSS (and tests) can read it too.
 */
export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.dataset.theme = theme;
}

/**
 * Runs blocking in <head> so the stored theme is on <html> before first paint —
 * without it a dark-theme visitor gets a white flash on every navigation.
 * Kept dependency-free and inlined as a string because it has to execute before
 * any bundle loads.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t!=="light"&&t!=="dark"){t=${JSON.stringify(
  DEFAULT_THEME,
)};}var r=document.documentElement;r.classList.toggle("dark",t==="dark");r.dataset.theme=t;}catch(e){}})();`;
