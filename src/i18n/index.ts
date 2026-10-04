/**
 * Internationalisation (CC-71). English and Hindi.
 *
 * Scope is the complaint journey - signing in, raising and tracking a
 * complaint, and the staff queue that resolves it - because that is where
 * the roadmap's users are: non-teaching staff, many of whom read Hindi more
 * comfortably than English. Untranslated screens fall back to English rather
 * than showing keys.
 *
 * The choice is remembered per browser. It is not stored on the account:
 * a shared lab computer should follow whoever set it, not flip with each
 * sign-in.
 *
 * See campus_cure_backend/docs/specs/CC-71-i18n.md.
 */

import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import { en } from './en';
import { hi } from './hi';

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

const STORAGE_KEY = 'cc-lang';

const stored = (): LanguageCode | null => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'en' || value === 'hi' ? value : null;
  } catch {
    return null;
  }
};

const initial: LanguageCode =
  stored() ?? (navigator.language?.toLowerCase().startsWith('hi') ? 'hi' : 'en');

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
  },
  lng: initial,
  fallbackLng: 'en',
  // Keys like "Raise Complaint" contain spaces but never dots or colons, so
  // the defaults are safe; React already escapes rendered strings.
  interpolation: { escapeValue: false },
  returnNull: false,
});

const applyDocumentLanguage = (code: string) => {
  document.documentElement.lang = code;
};
applyDocumentLanguage(initial);

export const setLanguage = async (code: LanguageCode): Promise<void> => {
  await i18n.changeLanguage(code);
  applyDocumentLanguage(code);
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // Private mode: the choice lasts for this tab only, which is fine.
  }
};

/**
 * Translated labels for the enums the complaint screens show everywhere.
 * Falls back to the English label for a value this list has never seen, so a
 * new backend status renders as text rather than as a raw key.
 */
export const useLabels = () => {
  const { t } = useTranslation();
  return {
    status: (value: string, fallback?: string) =>
      t(`status.${value}`, { defaultValue: fallback ?? value.replace(/_/g, ' ') }),
    priority: (value: number | string) =>
      t(`priority.${value}`, { defaultValue: `P${value}` }),
    category: (value: string | null | undefined) =>
      value
        ? t(`category.${value}`, { defaultValue: value.replace(/_/g, ' ') })
        : t('category.GENERAL'),
    nav: (label: string) => t(`nav.${label}`, { defaultValue: label }),
  };
};

export default i18n;
