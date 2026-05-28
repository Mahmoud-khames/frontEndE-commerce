import type { Product } from "@/types";

const toFiniteNumber = (value: unknown): number => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const isDateValid = (dateValue?: string): boolean => {
  if (!dateValue) return true;

  const endDate = new Date(dateValue).getTime();
  return Number.isNaN(endDate) || Date.now() <= endDate;
};

export const isProductDiscountActive = (
  product?: Partial<Product> | null
): boolean => {
  if (!product) return false;

  const price = toFiniteNumber(product.productPrice);
  const discountPrice = toFiniteNumber(product.productDiscountPrice);
  const discountPercentage = toFiniteNumber(
    product.productDiscountPercentage || product.productDiscount
  );

  return Boolean(
    product.hasActiveDiscount &&
      isDateValid(product.productDiscountEndDate) &&
      price > 0 &&
      discountPrice > 0 &&
      discountPrice < price &&
      discountPercentage > 0
  );
};

export const getProductDisplayPricing = (
  product?: Partial<Product> | null
) => {
  const price = toFiniteNumber(product?.productPrice);
  const discountPrice = toFiniteNumber(product?.productDiscountPrice);
  const discountPercentage = Math.round(
    toFiniteNumber(product?.productDiscountPercentage || product?.productDiscount)
  );
  const hasDiscount = isProductDiscountActive(product);

  return {
    price,
    currentPrice: hasDiscount ? discountPrice : price,
    originalPrice: hasDiscount ? price : null,
    discountPercentage: hasDiscount ? discountPercentage : null,
    hasDiscount,
  };
};
