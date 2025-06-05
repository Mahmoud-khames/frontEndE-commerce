import { Languages } from "@/constants/enums";

// أنواع اللغات المدعومة
export type LanguageType = Languages.ARABIC | Languages.ENGLISH;

// هيكل إعدادات i18n
type i18nType = {
  defaultLocale: LanguageType;
  locales: LanguageType[];
};

export const i18n: i18nType = {
  defaultLocale: Languages.ARABIC,
  locales: [Languages.ARABIC, Languages.ENGLISH],
};

// نوع لكل Locale مدعوم (واحد من الـ locales المحددين)
export type Locale = (typeof i18n)["locales"][number];
