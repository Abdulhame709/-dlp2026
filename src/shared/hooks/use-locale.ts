'use client';

import * as React from 'react';
import { Locale, translate } from '@/core/utils/i18n';

/**
 * React hook that provides the current locale and a t() helper
 * that resolves translation keys with automatic fallback to English.
 *
 * Reads the active language from localStorage (set by the TopNav language switcher).
 * Re-renders when the storage key changes.
 */
export function useLocale() {
  const [locale, setLocale] = React.useState<Locale>('en');

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    function sync() {
      const raw = localStorage.getItem('language') || 'en';
      setLocale(raw === 'ar' ? 'ar' : 'en');
    }

    sync();
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const t = React.useCallback(
    (path: string, replacements?: Record<string, string | number>) =>
      translate(locale, path, replacements),
    [locale]
  );

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return { locale, dir, t };
}
