/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useAppSelector } from "@/redux/hooks";
import { selectWishlistItems, selectWishlistLoading } from "@/redux/features/wishList/wishlistSlice";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export default function WishListItems({ translations, locale }: { translations: any; locale: string }) {
  const wishlist = useAppSelector(selectWishlistItems);
  const loading = useAppSelector(selectWishlistLoading);
  const isRTL = locale === "ar";
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4 items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 justify-items-center">
          {wishlist.map((item) => (
            <ProductCard key={item._id} product={item} />
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 justify-items-center w-full text-center">
          <div className="flex flex-col items-center justify-center">
            <h4 className="text-2xl font-bold">{translations.wishlist.empty}</h4>
            <div className="my-10 flex flex-col md:flex-row justify-end gap-2 group w-fit">
              <Link
                href={`/${locale}/products`}
                locale={locale}
                className="text-black font-semibold border-2 border-black px-12 py-4 group-hover:bg-black group-hover:text-white transition-all duration-300"
              >
                {translations.wishlist.returnToShop}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}