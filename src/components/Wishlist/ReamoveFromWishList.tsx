"use client";

import { useCallback } from "react";
import { useRemoveFromWishlist } from "@/hooks";
import { Product } from "@/types";
import { Button } from "../ui/button";
import { Trash } from "lucide-react";
import { toast } from "react-hot-toast";

export default function RemoveFromWishList({ product }: { product: Product }) {
  const removeFromWishlistMutation = useRemoveFromWishlist();

  const handleRemoveFromWishlist = useCallback(async () => {
    try {
      await removeFromWishlistMutation.mutateAsync(product._id);
      toast.success(`${product.productName} removed from wishlist!`);
    } catch (error) {
      toast.error("Failed to remove from wishlist");
      console.error(error);
    }
  }, [product, removeFromWishlistMutation]);

  return (
    <Button
      className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-white bg-secondary hover:bg-red-600"
      onClick={handleRemoveFromWishlist}
      aria-label={`Remove ${product.productName} from wishlist`}
    >
      <Trash className="w-4 h-4" />
    </Button>
  );
}
