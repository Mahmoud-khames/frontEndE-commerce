import type { Product } from "@/types";

export const getProductReviewCount = (
  product?: Partial<Product> | null
): number => {
  if (!product) return 0;

  if (Array.isArray(product.productReviews) && product.productReviews.length > 0) {
    return product.productReviews.length;
  }

  return Number(product.productRating) > 0 ? 1 : 0;
};
