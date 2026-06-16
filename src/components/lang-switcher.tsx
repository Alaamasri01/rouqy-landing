'use client';

import { useLang } from '@/lib/lang-context';

export default function LangSwitcher() {
  const { lang, toggle } = useLang();

  return (
    <button
      type="button"
      onClick={toggle}
      className="lang-switcher"
      aria-label={lang === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
    >
      {lang === 'en' ? 'ع' : 'EN'}
    </button>
  );
}
