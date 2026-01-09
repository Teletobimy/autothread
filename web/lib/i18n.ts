// Simple i18n system
export type Locale = 'ko' | 'en';

export const locales: Locale[] = ['ko', 'en'];

export const localeNames: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
};

// Get browser's preferred locale
export function getBrowserLocale(): Locale {
  if (typeof window === 'undefined') return 'ko';
  
  const browserLang = navigator.language.split('-')[0];
  return browserLang === 'ko' ? 'ko' : 'en';
}

// Get stored locale from localStorage
export function getStoredLocale(): Locale | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem('locale');
  if (stored && locales.includes(stored as Locale)) {
    return stored as Locale;
  }
  return null;
}

// Save locale to localStorage
export function setStoredLocale(locale: Locale): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('locale', locale);
}
