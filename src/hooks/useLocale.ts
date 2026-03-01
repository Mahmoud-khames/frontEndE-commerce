// src/hooks/useLocale.ts
'use client';

import { useParams } from 'next/navigation';
import type { Locale } from '@/types';

export const useLocale = () => {
  const params = useParams();
  const locale = (params?.locale as Locale) || 'en';
  const isRTL = locale === 'ar';

  const getLocalizedValue = <T extends { en: T['en']; ar: T['ar'] }>(
    obj: T
  ): T['en'] | T['ar'] => {
    return locale === 'ar' ? obj.ar : obj.en;
  };

  const getProductName = (product: {
    productNameEn: string;
    productNameAr: string;
  }): string => {
    return locale === 'ar' ? product.productNameAr : product.productNameEn;
  };

  const getProductDescription = (product: {
    productDescriptionEn: string;
    productDescriptionAr: string;
  }): string => {
    return locale === 'ar'
      ? product.productDescriptionAr
      : product.productDescriptionEn;
  };

  const getCategoryName = (category: {
    nameEn: string;
    nameAr: string;
  }): string => {
    return locale === 'ar' ? category.nameAr : category.nameEn;
  };

  return {
    locale,
    isRTL,
    getLocalizedValue,
    getProductName,
    getProductDescription,
    getCategoryName,
  };
};