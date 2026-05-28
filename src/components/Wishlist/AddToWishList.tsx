"use client";

import { Toggle } from "@/components/ui/toggle";
import { Heart } from "lucide-react";
import { Product } from "@/types";
import { toast } from "react-hot-toast";
import { useCallback } from "react";
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from "@/hooks";
import { getSafeErrorMessage } from "@/lib/apiError";
import { getProductName } from "@/lib/localized";

export default function AddToWishlist({ product }: { product: Product }) {
  const { data: wishlistData } = useWishlist();
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();

  const wishlist = wishlistData?.data?.wishlist || [];
  const isInWishlist = wishlist.some((item) => item._id === product._id);
  const displayName = getProductName(product, "en");

  const handleToggleWishlist = useCallback(async () => {
    try {
      if (isInWishlist) {
        await removeFromWishlistMutation.mutateAsync(product._id);
        toast.success(`${displayName} removed from wishlist`);
      } else {
        await addToWishlistMutation.mutateAsync(product._id);
        toast.success(`${displayName} added to wishlist`);
      }
    } catch (error) {
      toast.error(getSafeErrorMessage(error, "en", "Failed to update wishlist"));
    }
  }, [
    isInWishlist,
    product,
    displayName,
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
          ? `Remove ${displayName} from Wishlist`
          : `Add ${displayName} to Wishlist`
      }
    >
      <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
    </Toggle>
  );
}
