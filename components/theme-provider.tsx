'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  applyTheme,
  DEFAULT_THEME,
  isTheme,
  THEME_STORAGE_KEY,
  type Theme,
} from '@/lib/theme';

type ThemeContextValue = {
  theme: Theme;
  /** False until the stored preference has been read on the client. */
  ready: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export default function ThemeProvider({ children }: { children: ReactNode }) {
  // Always starts at the default so server and client markup agree; the real
  // preference is read in the effect below (the inline head script has already
  // painted it, so there is no visible correction).
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      // Private mode / storage disabled — fall back to the default.
    }

    const initial = isTheme(stored) ? stored : DEFAULT_THEME;
    setThemeState(initial);
    applyTheme(initial);
    setReady(true);
  }, []);

  // Keep tabs in sync when the preference changes in another one.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      const next = isTheme(event.newValue) ? event.newValue : DEFAULT_THEME;
      setThemeState(next);
      applyTheme(next);
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Preference just won't survive the session.
    }
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      ready,
      setTheme,
      toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    }),
    [theme, ready, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return context;
}
