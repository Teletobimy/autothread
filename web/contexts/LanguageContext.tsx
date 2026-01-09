'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Locale, getBrowserLocale, getStoredLocale, setStoredLocale, locales, localeNames } from '@/lib/i18n';
import { translations, TranslationKeys } from '@/lib/translations';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationKeys;
  locales: typeof locales;
  localeNames: typeof localeNames;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ko');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Get locale from storage or browser preference
    const storedLocale = getStoredLocale();
    const browserLocale = getBrowserLocale();
    const initialLocale = storedLocale || browserLocale;
    
    setLocaleState(initialLocale);
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    setStoredLocale(newLocale);
    
    // Update html lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale;
    }
  }, []);

  const t = translations[locale];

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ 
        locale: 'ko', 
        setLocale, 
        t: translations.ko,
        locales,
        localeNames,
      }}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, locales, localeNames }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Convenience hook for just translations
export function useTranslation() {
  const { t, locale } = useLanguage();
  return { t, locale };
}
