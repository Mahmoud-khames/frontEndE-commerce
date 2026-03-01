"use client";

import { useAuth } from "@/providers";
import { useCart, useAddToCart } from "@/hooks";
import { Product } from "@/types";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useCallback, useState } from "react";

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
    if (disabled) {
      // Check if sizes or colors are required but not selected
      if (
        product.productSizes &&
        product.productSizes.length > 0 &&
        !selectedSize
      ) {
        toast.error("Please select a size");
        return;
      }
      if (
        product.productColors &&
        product.productColors.length > 0 &&
        !selectedColor
      ) {
        toast.error("Please select a color");
        return;
      }
    }

    try {
      setIsLoading(true);

      if (!isAuthenticated) {
        toast.error("Please log in to add items to cart");
        return;
      }

      await addToCartMutation.mutateAsync({
        productId: product._id,
        quantity,
        size: selectedSize,
        color: selectedColor,
      });

      toast.success(`${product.productName} added to cart!`);
    } catch (error) {
      toast.error("Failed to add to cart");
      console.error(error);
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
