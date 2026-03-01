// i18n.config.ts
export type Locale = 'en' | 'ar';

export const defaultLocale: Locale = 'en';
export const locales: Locale[] = ['en', 'ar'];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
};

export const localeDirections: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  ar: 'rtl',
};
