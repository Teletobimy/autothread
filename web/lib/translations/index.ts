import { ko } from './ko';
import { en } from './en';
import type { Locale } from '../i18n';

export const translations = {
  ko,
  en,
} as const;

export function getTranslations(locale: Locale) {
  return translations[locale];
}

export type { TranslationKeys } from './ko';
