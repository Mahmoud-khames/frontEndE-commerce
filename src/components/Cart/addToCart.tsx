"use client";

import { useAuth } from "@/providers";
import { useCart, useAddToCart } from "@/hooks";
import { Product } from "@/types";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useCallback, useState } from "react";
import {
  getProductColors,
  getProductName,
  getProductSizes,
} from "@/lib/localized";
import { getSafeErrorMessage } from "@/lib/apiError";

export default function AddToCart({
  product,
  quantity = 1,
  selectedSize = null,
  selectedColor = null,
  disabled = false,
}: {
  product: Product;
  quantity?: number;
  selectedSize?: string | null;
  selectedColor?: string | null;
  disabled?: boolean;
}) {
  const { isAuthenticated } = useAuth();
  const addToCartMutation = useAddToCart();
  const { locale } = useParams();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = useCallback(async () => {
    const lang = locale === "ar" ? "ar" : "en";
    const sizes = getProductSizes(product, lang);
    const colors = getProductColors(product, lang);

    if (disabled) {
      if (sizes.length > 0 && !selectedSize) {
        toast.error(lang === "ar" ? "من فضلك اختر المقاس" : "Please select a size");
        return;
      }
      if (colors.length > 0 && !selectedColor) {
        toast.error(lang === "ar" ? "من فضلك اختر اللون" : "Please select a color");
        return;
      }
    }

    try {
      setIsLoading(true);

      if (!isAuthenticated) {
        toast.error(
          lang === "ar"
            ? "من فضلك سجل الدخول لإضافة منتجات للسلة"
            : "Please log in to add items to cart"
        );
        return;
      }

      await addToCartMutation.mutateAsync({
        productId: product._id,
        quantity,
        size: selectedSize,
        color: selectedColor,
      });

      toast.success(
        lang === "ar"
          ? `تمت إضافة ${getProductName(product, lang)} إلى السلة`
          : `${getProductName(product, lang)} added to cart`
      );
    } catch (error) {
      toast.error(
        getSafeErrorMessage(
          error,
          lang,
          lang === "ar" ? "تعذر إضافة المنتج للسلة" : "Failed to add to cart"
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    product,
    quantity,
    selectedSize,
    selectedColor,
    disabled,
    isAuthenticated,
    addToCartMutation,
    locale,
  ]);

  return (
    <button
      onClick={handleAddToCart}
      disabled={disabled || isLoading}
      className={`w-full h-full flex items-center justify-center transition-colors duration-300 ${
        disabled || isLoading
          ? "bg-gray-400 cursor-not-allowed"
          : "hover:bg-secondary"
      }`}
    >
      {isLoading
        ? locale === "ar"
          ? "...جاري الإضافة"
          : "Adding..."
        : locale === "ar"
        ? "إضافة إلى السلة"
        : "Add To Cart"}
    </button>
  );
}
