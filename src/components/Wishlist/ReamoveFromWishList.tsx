"use client";
import { removeFromWishlist, removeFromWishlistAsync } from "@/redux/features/wishList/wishlistSlice";
import React from "react";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { IProduct } from "@/types/type";
import { Button } from "../ui/button";
import { Trash } from "lucide-react";
import { toast } from "react-toastify";

export default function ReamoveFromWishList({ product }: { product: IProduct }) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);

  const handleRemoveFromWishlist = () => {
    if (user) {
      dispatch(removeFromWishlistAsync(product._id));
    } else {
      dispatch(removeFromWishlist(product._id));
      toast.success(`${product.productName} removed from wishlist!`);
    }
  };

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
