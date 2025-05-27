"use client";
import Slider from "../../Slider";
import ProductCard, { ProductCardSkeleton } from "../../ProductCard";
import { IProduct } from "@/types/type";
import Link from "@/components/link";
import axios from "axios";

import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchProducts } from "@/redux/features/prodect/prodectSlice";
import { useEffect, useState } from "react";

export default function ProductListSales({ t, locale, filter = {} }: { 
  t: any; 
  locale: string;
  filter?: { hasActiveDiscount?: boolean }
}) {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const apiURL = process.env.NEXT_PUBLIC_API_URL;
  const { status } = useAppSelector((state) => state.products);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        // Use the discounted products endpoint if hasActiveDiscount is true
        const endpoint = filter?.hasActiveDiscount 
          ? `${apiURL}/api/product/discounted` 
          : `${apiURL}/api/product`;
        
        const response = await axios.get(endpoint);
        if (response.data.success) {
          setProducts(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [apiURL, filter?.hasActiveDiscount]);

  return (
    <div className="flex flex-col items-start w-full">
      {/* Slider with Product Cards - make it responsive */}
      <Slider
        slidesPerView={1.2}
        spaceBetween={10}
        breakpoints={{
          480: { slidesPerView: 1.5, spaceBetween: 15 },
          640: { slidesPerView: 2.2, spaceBetween: 20 },
          768: { slidesPerView: 2.5, spaceBetween: 20 },
          1024: { slidesPerView: 3.5, spaceBetween: 25 },
          1280: { slidesPerView: 4, spaceBetween: 30 },
        }}
        className="w-full pb-6" // Add padding for pagination dots
      >
        {isLoading || status === "loading"
          ? // Skeletons during loading
            Array(8)
              .fill(0)
              .map((_, index) => <ProductCardSkeleton key={index} />)
          : // Products after loading
            products.map((product: IProduct) => (
              <ProductCard key={product._id} product={product} />
            ))}
      </Slider>

      {/* View All Products Button - make it responsive */}
      <div className="flex justify-center w-full mt-8 md:mt-14">
        <Link
          href={`/${locale}/products`}
          className="bg-secondary text-white px-6 md:px-8 py-2.5 md:py-3 rounded text-sm md:text-base font-medium hover:bg-[#c13535] transition-colors cursor-pointer"
        >
          {t.home.viewAll}
        </Link>
      </div>
    </div>
  );
}
