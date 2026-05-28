"use client";

import { Eye } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import renderStars from "./renderStars";
import { Product } from "@/types";
import Link from "@/components/link";
import AddToCart from "./Cart/addToCart";
import AddToWishList from "./Wishlist/AddToWishList";
import { usePathname } from "next/navigation";
import ReamoveFromWishList from "./Wishlist/ReamoveFromWishList";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getProductColors,
  getProductName,
  getProductSizes,
} from "@/lib/localized";
import { getProductDisplayPricing } from "@/lib/productPricing";
import { getProductReviewCount } from "@/lib/reviews";

// إضافة مكون ProductCardSkeleton
export function ProductCardSkeleton() {
  return (
    <div className="product-item flex flex-col items-center w-full max-w-[270px] h-[350px] flex-shrink-0 relative">
      <div className="relative w-full h-[250px] overflow-hidden bg-[#f5f5f5]">
        {/* صورة المنتج */}
        <Skeleton className="h-full w-full" />

        {/* أيقونات القلب/العين */}
        <div className="absolute top-2 right-2 flex items-center justify-center gap-2">
          <div className="flex items-center justify-center flex-col gap-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </div>

        {/* زر إضافة إلى السلة */}
        <Skeleton className="absolute bottom-0 left-0 w-full h-10" />
      </div>

      {/* تفاصيل المنتج */}
      <div className="flex flex-col items-start w-full px-2 mt-4 gap-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export default function ProductCard({
  product,
  isLoading = false,
  t,
}: {
  product: Product;
  isLoading?: boolean;
  t?: any;
}) {
  const pathname = usePathname();
  const { locale } = useParams();
  const currentLocale = locale === "ar" ? "ar" : "en";
  const productName = getProductName(product, currentLocale, "Product");
  const pricing = getProductDisplayPricing(product);
  const reviewCount = getProductReviewCount(product);
  const newLabel = currentLocale === "ar" ? "جديد" : "NEW";
  const unavailableTitle =
    currentLocale === "ar" ? "رابط المنتج غير متاح" : "Product link unavailable";
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // إذا كان التحميل جاريًا، اعرض الهيكل العظمي
  if (isLoading) {
    return <ProductCardSkeleton />;
  }

  // التعامل مع أخطاء تحميل الصورة
  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div
      key={product._id}
      className="product-item flex flex-col items-center w-full max-w-[270px] h-[350px] flex-shrink-0 relative group"
    >
      <div className="relative w-full h-[250px] overflow-hidden bg-[#f5f5f5]">
        {/* Image Container */}
        <div className="h-full bg-gray-200 flex items-center justify-center group-hover:scale-105 transition-all duration-300 z-0">
          {!imageLoaded && !imageError && (
            <Skeleton className="w-[70%] h-[70%]" />
          )}

          {product.productImage && (
            <Image
              src={
                imageError
                  ? "/placeholder-product.jpg"
                  : `${product?.productImage}`
              }
              width={190}
              height={170}
              alt={
                productName || "Product Image"
              }
              className={`object-contain max-w-[90%] max-h-[90%] w-auto h-auto ${
                !imageLoaded && !imageError ? "invisible" : "visible"
              }`}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          )}
        </div>

        {/* Badges Container */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {/* Discount Badge */}
          {pricing.discountPercentage !== null && (
            <div className="w-14 h-7 bg-secondary rounded flex items-center justify-center">
              <p className="text-white text-[12px] font-semibold">
                -{pricing.discountPercentage}%
              </p>
            </div>
          )}

          {/* New Badge */}
          {product.NEW && (
            <div className="w-14 h-7 bg-green-400 rounded flex items-center justify-center">
              <p className="text-white text-[12px] font-semibold">
                {newLabel}
              </p>
            </div>
          )}
        </div>

        {/* Heart/Eye Icons */}
        {pathname === `/${locale}/wishlist/` && (
          <div className="absolute top-2 right-2 flex items-center justify-center gap-2">
            <div className="flex items-center justify-center flex-col gap-2">
              <ReamoveFromWishList product={product} />
              {product.productSlug ? (
                <Link href={`/${locale}/products/${product.productSlug}`}>
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer">
                    <Eye className="text-black w-6 h-6 hover:text-secondary transition-all duration-300" />
                  </div>
                </Link>
              ) : (
                <div
                  className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center cursor-not-allowed"
                  title={unavailableTitle}
                >
                  <Eye className="text-gray-500 w-6 h-6" />
                </div>
              )}
            </div>
          </div>
        )}
        {pathname !== `/${locale}/wishlist/` && (
          <div className="absolute top-2 right-2 flex items-center justify-center gap-2">
            <div className="flex items-center justify-center flex-col gap-2">
              <AddToWishList product={product} />
              {product.productSlug ? (
                <Link href={`/${locale}/products/${product.productSlug}`}>
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer">
                    <Eye className="text-black w-6 h-6 hover:text-secondary transition-all duration-300" />
                  </div>
                </Link>
              ) : (
                <div
                  className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center cursor-not-allowed"
                  title={unavailableTitle}
                >
                  <Eye className="text-gray-500 w-6 h-6" />
                </div>
              )}
            </div>
          </div>
        )}
        {/* Add to Cart Button (Visible on Hover) */}
        <div className="absolute bottom-0 left-0 w-full h-10 bg-black text-white text-[16px] font-medium opacity-0 opacity-100 transition-opacity cursor-pointer">
          <AddToCart
            product={product}
            disabled={
              getProductSizes(product, currentLocale).length > 0 ||
              getProductColors(product, currentLocale).length > 0
            }
          />
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-col items-start w-full px-2">
        <div className="flex items-center justify-between w-full mt-4">
          <p className="text-[#000000] text-[16px] font-medium truncate max-w-full">
            {productName}
          </p>
        </div>

        {/* Price Display */}
        <div className="flex items-center gap-3">
          {/* Current Price (After Discount) */}
          <p className="text-secondary text-[16px] font-medium">
            ${pricing.currentPrice.toFixed(2)}
          </p>

          {/* Original Price (Strikethrough if discounted) */}
          {pricing.originalPrice !== null && (
            <p className="text-gray-400 text-[16px] line-through text-opacity-50">
              ${pricing.originalPrice.toFixed(2)}
            </p>
          )}
        </div>

        {/* Ratings */}
        <div className="flex items-center gap-1 mt-2">
          {renderStars(product.productRating)}
          <span className="text-gray-500 text-[14px] ml-2">
            ({reviewCount})
          </span>
        </div>
      </div>
    </div>
  );
}
