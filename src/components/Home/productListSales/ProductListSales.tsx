// components/Home/productListSales/ProductListSales.tsx
"use client";

import Slider from "../../Slider";
import ProductCard, { ProductCardSkeleton } from "../../ProductCard";
import { Product } from "@/types";
import Link from "@/components/link";
import { useDiscountedProducts } from "@/hooks/useProducts";

export default function ProductListSales({
  t,
  locale,
}: {
  t: any;
  locale: string;
}) {
  const { data: response, isLoading } = useDiscountedProducts();
  const products = (response?.data as unknown as Product[]) || [];

  // Don't render anything if no products and not loading
  if (!isLoading && products.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-start w-full">
      <Slider
        slidesPerView={2.1}
        spaceBetween={10}
        breakpoints={{
          480: { slidesPerView: 2.2, spaceBetween: 15 },
          640: { slidesPerView: 2.5, spaceBetween: 20 },
          768: { slidesPerView: 3, spaceBetween: 20 },
          1024: { slidesPerView: 3.5, spaceBetween: 25 },
          1280: { slidesPerView: 4, spaceBetween: 30 },
        }}
        className="w-full pb-6"
      >
        {isLoading
          ? Array(8)
              .fill(0)
              .map((_, index) => <ProductCardSkeleton key={index} />)
          : products.map((product: Product) => (
              <ProductCard key={product._id} product={product} t={t} />
            ))}
      </Slider>

      {products.length > 0 && (
        <div className="flex justify-center w-full mt-8 md:mt-14">
          <Link
            href={`/${locale}/products?discount=true`}
            className="bg-secondary text-white px-6 md:px-8 py-2.5 md:py-3 rounded text-sm md:text-base font-medium hover:bg-secondary/90 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            {t.home?.viewAll || "View All"}
          </Link>
        </div>
      )}
    </div>
  );
}
