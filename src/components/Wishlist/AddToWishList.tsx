/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Toggle } from "@/components/ui/toggle";
import {
  addToWishlist,
  removeFromWishlist,
  selectWishlistItems,
  addToWishlistAsync,
  removeFromWishlistAsync
} from "@/redux/features/wishList/wishlistSlice";
import { Heart } from "lucide-react";
import { IProduct } from "@/types/type";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import getTrans from "@/lib/translation";
import { LanguageType } from "@/i18n.config";
export default function AddToWishlist({ product }: { product: IProduct }) {
  const dispatch = useAppDispatch();
  const wishlist = useAppSelector(selectWishlistItems);
  const { user } = useAppSelector((state) => state.user);
  const isInWishlist = wishlist.some((item) => item._id === product._id);
  const { locale } = useParams();
  const [translations, setTranslations] = useState<any>(null);

  // جلب بيانات الترجمة بشكل غير متزامن
  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const trans = await getTrans(locale as LanguageType);
        setTranslations(trans.t);
      } catch (error) {
        console.error("Error fetching translations:", error);
        setTranslations({
          wishlist: {
            addToWishlist: "Add to Wishlist",
            removeFromWishlist: "Remove from Wishlist",
            addedToWishlist: "added to wishlist!",
            removedFromWishlist: "removed from wishlist!",
          },
        });
      }
    };

    fetchTranslations();
  }, [locale]);

  const handleToggleWishlist = () => {
    if (isInWishlist) {
      if (user) {
        dispatch(removeFromWishlistAsync(product._id));
      } else {
        dispatch(removeFromWishlist(product._id));
        toast.success(`${product.productName} ${translations?.wishlist?.removedFromWishlist || "removed from wishlist!"}`);
      }
    } else {
      if (user) {
        dispatch(addToWishlistAsync(product));
      } else {
        dispatch(addToWishlist(product));
        toast.success(`${product.productName} ${translations?.wishlist?.addedToWishlist || "added to wishlist!"}`);
      }
    }
  };

  // عرض حالة تحميل أثناء جلب الترجمة
  if (!translations) {
    return (
      <Toggle
        disabled
        className="w-8 h-8 rounded-full flex items-center justify-center cursor-not-allowed opacity-50 bg-white text-black"
        aria-label="Loading..."
      >
        <Heart className="h-4 w-4" />
      </Toggle>
    );
  }

  return (
    <Toggle
      pressed={isInWishlist}
      onPressedChange={handleToggleWishlist}
      className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
        isInWishlist ? "bg-secondary text-white" : "bg-white text-black"
      }`}
      aria-label={
        isInWishlist
          ? translations.wishlist.removeFromWishlist || "Remove from Wishlist"
          : translations.wishlist.addToWishlist || "Add to Wishlist"
      }
    >
      <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
    </Toggle>
  );
}
