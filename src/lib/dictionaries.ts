import en from '../dictionaries/en.json';
import ar from '../dictionaries/ar.json';

const dictionaries = {
  en,
  ar,
};

export const getDictionary = async (locale: string) => {
  return dictionaries[locale as keyof typeof dictionaries] || dictionaries.en;
};