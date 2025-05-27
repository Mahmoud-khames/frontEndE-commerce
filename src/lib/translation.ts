import { Locale } from '@/i18n.config';
import { Languages } from '@/constants/enums';

const dictionaries = {
  ar: () => import('@/dictionaries/ar.json').then((module) => module.default),
  en: () => import('@/dictionaries/en.json').then((module) => module.default),
};

const getTrans = async (locale: Locale) => {
  const translations = await (locale === Languages.ARABIC ? dictionaries.ar() : dictionaries.en());
  return {
    t: translations, // إزالة .default لأن translations هو الكائن المطلوب مباشرة
  };
};

export default getTrans;