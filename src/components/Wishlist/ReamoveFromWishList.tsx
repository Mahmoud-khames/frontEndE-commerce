"use client";

import { useCallback } from "react";
import { useRemoveFromWishlist } from "@/hooks";
import { Product } from "@/types";
import { Button } from "../ui/button";
import { Trash } from "lucide-react";
import { toast } from "react-hot-toast";
import { getSafeErrorMessage } from "@/lib/apiError";
import { getProductName } from "@/lib/localized";

export default function RemoveFromWishList({ product }: { product: Product }) {
  const removeFromWishlistMutation = useRemoveFromWishlist();
  const displayName = getProductName(product, "en");

  const handleRemoveFromWishlist = useCallback(async () => {
    try {
      await removeFromWishlistMutation.mutateAsync(product._id);
      toast.success(`${displayName} removed from wishlist`);
    } catch (error) {
      toast.error(getSafeErrorMessage(error, "en", "Failed to remove from wishlist"));
    }
  }, [product, removeFromWishlistMutation, displayName]);

  return (
    <Button
      className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-white bg-secondary hover:bg-red-600"
      onClick={handleRemoveFromWishlist}
      aria-label={`Remove ${displayName} from wishlist`}
    >
      <Trash className="w-4 h-4" />
    </Button>
  );
}
