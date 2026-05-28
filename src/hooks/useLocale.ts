// src/hooks/useLocale.ts
'use client';

import { useParams } from 'next/navigation';
import type { Category, Locale, Product } from '@/types';
import {
  getCategoryName,
  getLocalizedValue as readLocalizedValue,
  getProductDescription,
  getProductName,
} from '@/lib/localized';

export const useLocale = () => {
  const params = useParams();
  const locale = (params?.locale as Locale) || 'en';
  const isRTL = locale === 'ar';

  return {
    locale,
    isRTL,
    getLocalizedValue: (value: Parameters<typeof readLocalizedValue>[0]) =>
      readLocalizedValue(value, locale),
    getProductName: (product: Partial<Product>) =>
      getProductName(product, locale),
    getProductDescription: (product: Partial<Product>) =>
      getProductDescription(product, locale),
    getCategoryName: (category: Partial<Category>) =>
      getCategoryName(category, locale),
  };
};
