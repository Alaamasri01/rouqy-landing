'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import siteData from '@/data/site-data.json';

export type Lang = 'en' | 'ar';

// The shape of one locale's data (inferred from the English block).
export type SiteContent = (typeof siteData)['en'];

interface LangContextValue {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  t: SiteContent;
  setLang: (lang: Lang) => void;
  toggle: () => void;
}

const LangContext = createContext<LangContextValue | null>(null);

const STORAGE_KEY = 'rouqy-lang';

export function LangProvider({ children }: { children: ReactNode }) {
  // Default to English on the server to keep SSR markup stable;
  // we sync to the saved/browser preference after mount.
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const saved = (typeof window !== 'undefined'
      ? window.localStorage.getItem(STORAGE_KEY)
      : null) as Lang | null;

    if (saved === 'en' || saved === 'ar') {
      setLangState(saved);
    } else if (typeof navigator !== 'undefined' && navigator.language.startsWith('ar')) {
      setLangState('ar');
    }
  }, []);

  // Keep <html> lang/dir in sync so RTL + screen readers work correctly.
  useEffect(() => {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, lang);
    }
  }, [lang]);

  const setLang = useCallback((next: Lang) => setLangState(next), []);
  const toggle = useCallback(
    () => setLangState((p) => (p === 'en' ? 'ar' : 'en')),
    []
  );

  const value: LangContextValue = {
    lang,
    dir: lang === 'ar' ? 'rtl' : 'ltr',
    t: siteData[lang],
    setLang,
    toggle,
  };

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within <LangProvider>');
  return ctx;
}
