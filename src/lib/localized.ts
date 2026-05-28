import type { Category, Locale, Product } from "@/types";

export type SupportedLocale = Locale | string;

export type LocalizedValue<T = string> =
  | T
  | {
      en?: T;
      ar?: T;
    }
  | null
  | undefined;

const normalizeLocale = (locale?: SupportedLocale): Locale =>
  locale === "ar" ? "ar" : "en";

export const getLocalizedValue = (
  value: LocalizedValue<string>,
  locale?: SupportedLocale,
  fallback = ""
): string => {
  const lang = normalizeLocale(locale);

  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return fallback;

  return value[lang] || value.en || value.ar || fallback;
};

export const getLocalizedArray = (
  value: LocalizedValue<string[]>,
  locale?: SupportedLocale,
  fallback: string[] = []
): string[] => {
  const lang = normalizeLocale(locale);

  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value || typeof value !== "object") return fallback;

  const localized = value[lang] || value.en || value.ar;
  return Array.isArray(localized) ? localized.filter(Boolean) : fallback;
};

export const getProductName = (
  product?: Partial<Product> | null,
  locale?: SupportedLocale,
  fallback?: string
): string => {
  if (!product) return fallback || (normalizeLocale(locale) === "ar" ? "منتج" : "Product");

  return (
    getLocalizedValue(product.productName, locale) ||
    getLocalizedValue(product.name, locale) ||
    (normalizeLocale(locale) === "ar"
      ? product.productNameAr || product.productNameEn
      : product.productNameEn || product.productNameAr) ||
    fallback ||
    (normalizeLocale(locale) === "ar" ? "منتج" : "Product")
  );
};

export const getProductDescription = (
  product?: Partial<Product> | null,
  locale?: SupportedLocale,
  fallback = ""
): string => {
  if (!product) return fallback;

  return (
    getLocalizedValue(product.productDescription, locale) ||
    getLocalizedValue(product.description, locale) ||
    (normalizeLocale(locale) === "ar"
      ? product.productDescriptionAr || product.productDescriptionEn
      : product.productDescriptionEn || product.productDescriptionAr) ||
    fallback
  );
};

export const getProductColors = (
  product?: Partial<Product> | null,
  locale?: SupportedLocale
): string[] => {
  if (!product) return [];

  return (
    getLocalizedArray(product.productColors, locale).length
      ? getLocalizedArray(product.productColors, locale)
      : normalizeLocale(locale) === "ar"
        ? product.productColorsAr || product.productColorsEn || []
        : product.productColorsEn || product.productColorsAr || []
  );
};

export const getProductSizes = (
  product?: Partial<Product> | null,
  locale?: SupportedLocale
): string[] => {
  if (!product) return [];

  return (
    getLocalizedArray(product.productSizes, locale).length
      ? getLocalizedArray(product.productSizes, locale)
      : normalizeLocale(locale) === "ar"
        ? product.productSizesAr || product.productSizesEn || []
        : product.productSizesEn || product.productSizesAr || []
  );
};

export const getCategoryName = (
  category?: Partial<Category> | null,
  locale?: SupportedLocale,
  fallback?: string
): string => {
  if (!category) return fallback || (normalizeLocale(locale) === "ar" ? "تصنيف" : "Category");

  return (
    getLocalizedValue(category.name, locale) ||
    (normalizeLocale(locale) === "ar"
      ? category.nameAr || category.nameEn
      : category.nameEn || category.nameAr) ||
    fallback ||
    (normalizeLocale(locale) === "ar" ? "تصنيف" : "Category")
  );
};

export const getCategoryDescription = (
  category?: Partial<Category> | null,
  locale?: SupportedLocale,
  fallback = ""
): string => {
  if (!category) return fallback;

  return (
    getLocalizedValue(category.description, locale) ||
    (normalizeLocale(locale) === "ar"
      ? category.descriptionAr || category.descriptionEn
      : category.descriptionEn || category.descriptionAr) ||
    fallback
  );
};
