"use client";
import renderStars from "@/components/renderStars";

import Image from "next/image";
// import Skeleton from "react-loading-skeleton";

import React, { useEffect, useState } from "react";
import Link from "@/components/link";
import AddToWishlist from "@/components/Wishlist/AddToWishList";
import AddToCart from "@/components/Cart/addToCart";

import { IProduct } from "@/types/type";
import { getProduct } from "@/server";

// Custom skeleton component
const CustomSkeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

export default function ProductItem({ slug }: { slug: string }) {
  const [product, setProduct] = useState<IProduct | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const fetchProduct = React.useCallback(() => {
    return getProduct(slug);
  }, [slug]);

  useEffect(() => {
    setIsLoading(true);
    fetchProduct().then((data) => {
      setProduct(data.data.data);
      setIsLoading(false);
    }).catch(error => {
      console.error("Error fetching product:", error);
      setIsLoading(false);
    });
  }, [fetchProduct]);

  // State for selected color, size, and quantity
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product?.productColors && product.productColors.length > 0 
      ? product.productColors[0] 
      : null
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product?.productSizes && product.productSizes.length > 0 
      ? product.productSizes[0] 
      : null
  );
  const [quantity, setQuantity] = useState<number>(1);

  // Handle quantity changes
  const handleQuantityChange = (change: number) => {
    setQuantity((prev) => Math.max(1, prev + change));
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Product image skeleton */}
          <div className="w-full md:w-1/2">
            <CustomSkeleton className="w-full aspect-square rounded-md" />
          </div>
          
          {/* Product details skeleton */}
          <div className="w-full md:w-1/2 space-y-4">
            <CustomSkeleton className="h-8 w-3/4" />
            <CustomSkeleton className="h-6 w-1/2" />
            <CustomSkeleton className="h-24 w-full" />
            <CustomSkeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  // If product is not found, show a fallback
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p>Product not found.</p>
      </div>
    );
  }
  
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  return (
    <>
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-gray-600">
        <div className="flex justify-start items-center gap-2 text-xs sm:text-sm">
          <Link href="/" className="text-gray-600 hover:underline">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="text-gray-600 hover:underline">
            Products
          </Link>
          <span>/</span>
          <Link
            href={`/products/${slug}`}
            className="text-black hover:underline"
          >
            {product.productName}
          </Link>
        </div>
      </div>

      {/* Product Section */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Product images */}
          <div className="w-full md:w-1/2">
            <div className="relative aspect-square mb-2 sm:mb-4 border rounded-md overflow-hidden">
              <Image
                src={`${apiURL}${selectedImage || product.productImages[0]}`}
                alt={product.productName}
                fill
                className="
                  object-cover
                  transition-transform
                  duration-300
                  hover:scale-105
                "
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.productImages.map((image, index) => (
                <button
                  key={index}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-md border-2 cursor-pointer flex-shrink-0 ${
                    selectedImage === image
                      ? "border-secondary"
                      : "border-gray-300"
                  }`}
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={`${apiURL}${image}`}
                      alt={`${product.productName} thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Product Details Section */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            {/* Product Name */}
            <h2 className="text-xl sm:text-2xl font-bold">
              {product.productName}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {renderStars(product.productRating || 0)}
              </div>
              <span className="text-gray-500 text-xs sm:text-sm">
                ({product.productReviews?.length || 0} Reviews)
              </span>
              <span className="text-green-600 text-xs sm:text-sm">In Stock</span>
            </div>

            {/* Price */}
            <p className="text-xl sm:text-2xl font-semibold">
              ${product.productDiscountPrice || product.productPrice}
            </p>

            {/* Description */}
            <p className="text-gray-600 text-xs sm:text-sm">
              {product.productDescription}
            </p>

            {/* Divider */}
            <div className="w-full h-[1px] bg-gray-200"></div>

            {/* Colors */}
            <div className="flex items-center gap-3">
              <span className="text-black text-sm sm:text-base">Colours:</span>
              <div className="flex gap-2">
                {product.productColors && product.productColors.length > 0 ? (
                  product.productColors.map((color, index) => (
                    <button
                      key={index}
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 cursor-pointer ${
                        selectedColor === color ? "border-black" : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color.toLowerCase() }}
                      onClick={() => setSelectedColor(color)}
                      aria-label={`Select color ${color}`}
                    />
                  ))
                ) : (
                  <span className="text-gray-500 text-xs sm:text-sm">N/A</span>
                )}
              </div>
            </div>

            {/* Sizes */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-black text-sm sm:text-base">Size:</span>
              <div className="flex gap-2 flex-wrap">
                {product.productSizes && product.productSizes.length > 0 ? (
                  product.productSizes.map((size, index) => (
                    <button
                      key={index}
                      className={`px-2 py-1 sm:px-3 sm:py-1 border rounded-md text-xs sm:text-sm cursor-pointer ${
                        selectedSize === size
                          ? "border-secondary bg-secondary text-white"
                          : "border-gray-300"
                      } hover:bg-secondary hover:text-white transition-all duration-300`}
                      onClick={() => setSelectedSize(size)}
                      aria-label={`Select size ${size}`}
                    >
                      {size}
                    </button>
                  ))
                ) : (
                  <span className="text-gray-500 text-xs sm:text-sm">N/A</span>
                )}
              </div>
            </div>

            {/* Quantity, Buy Now, and Wishlist */}
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              {/* Quantity Selector */}
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  className="px-2 py-1 sm:px-3 sm:py-2 text-base sm:text-lg cursor-pointer hover:bg-secondary hover:text-white transition-all duration-300 rounded-l-md"
                  onClick={() => handleQuantityChange(-1)}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base">
                  {quantity}
                </span>
                <button
                  className="px-2 py-1 sm:px-3 sm:py-2 text-base sm:text-lg cursor-pointer hover:bg-secondary hover:text-white transition-all duration-300 rounded-r-md"
                  onClick={() => handleQuantityChange(1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <div className="w-[120px] rounded-2xl h-10 bg-secondary text-white font-medium cursor-pointer">
                <AddToCart
                  product={{
                    ...product,
                    oldProductPrice: Number(product.oldProductPrice) || 0,
                    productDiscountPrice: Number(product.productDiscountPrice) || 0,
                  }}
                  quantity={quantity}
                  selectedSize={selectedSize}
                  selectedColor={selectedColor}
                  disabled={
                    (product.productSizes && product.productSizes.length > 0 && !selectedSize) ||
                    (product.productColors && product.productColors.length > 0 && !selectedColor)
                  }
                />
              </div>

              {/* Wishlist Heart */}
              <AddToWishlist product={product} />
            </div>

            {/* Free Delivery & Return Policy */}
            <div className="mt-4 border border-gray-300 rounded-md">
              <div className="p-4 flex items-center gap-3 border-b border-gray-300">
                <span className="text-xl sm:text-2xl">🚚</span>
                <div>
                  <p className="text-xs sm:text-sm font-semibold">
                    Free Delivery
                  </p>
                  <p className="text-xs text-gray-600">
                    Enter your postal code for Delivery Availability
                  </p>
                </div>
              </div>
              <div className="p-4 flex items-center gap-3">
                <span className="text-xl sm:text-2xl">🔄</span>
                <div>
                  <p className="text-xs sm:text-sm font-semibold">
                    Return Delivery
                  </p>
                  <p className="text-xs text-gray-600">
                    Free 30 Days Delivery Returns.{" "}
                    <a href="#" className="underline">
                      Details
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
