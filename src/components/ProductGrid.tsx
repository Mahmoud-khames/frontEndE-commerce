"use client";

import React from "react";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";
import { IProduct } from "@/types/type";

interface ProductGridProps {
  products: IProduct[];
  isLoading: boolean;
}

export default function ProductGrid({ products, isLoading }: ProductGridProps) {
  // إذا كان التحميل جاريًا، اعرض مجموعة من الهياكل العظمية
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {Array(8).fill(0).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // إذا لم تكن هناك منتجات، اعرض رسالة
  if (!products || products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-lg text-gray-500">لا توجد منتجات متاحة</p>
      </div>
    );
  }

  // اعرض المنتجات
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}