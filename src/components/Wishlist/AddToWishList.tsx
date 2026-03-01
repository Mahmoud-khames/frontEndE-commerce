"use client";

import { Toggle } from "@/components/ui/toggle";
import { Heart } from "lucide-react";
import { Product } from "@/types";
import { toast } from "react-hot-toast";
import { useCallback } from "react";
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from "@/hooks";

export default function AddToWishlist({ product }: { product: Product }) {
  const { data: wishlistData } = useWishlist();
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();

  const wishlist = wishlistData?.data?.wishlist || [];
  const isInWishlist = wishlist.some((item) => item._id === product._id);

  const handleToggleWishlist = useCallback(async () => {
    try {
      if (isInWishlist) {
        await removeFromWishlistMutation.mutateAsync(product._id);
        toast.success(`${product.productName} removed from wishlist!`);
      } else {
        await addToWishlistMutation.mutateAsync(product._id);
        toast.success(`${product.productName} added to wishlist!`);
      }
    } catch (error) {
      toast.error("Failed to update wishlist");
      console.error(error);
    }
  }, [
    isInWishlist,
    product,
    addToWishlistMutation,
    removeFromWishlistMutation,
  ]);

  return (
    <Toggle
      pressed={isInWishlist}
      onPressedChange={handleToggleWishlist}
      className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
        isInWishlist ? "bg-secondary text-white" : "bg-white text-black"
      }`}
      aria-label={
        isInWishlist
          ? `Remove ${product.productName} from Wishlist`
          : `Add ${product.productName} to Wishlist`
      }
    >
      <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
    </Toggle>
  );
}
