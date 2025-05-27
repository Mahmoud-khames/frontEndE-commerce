"use client";
import Link from "@/components/link";
import ProductCard, { ProductCardSkeleton } from "../../ProductCard";
import { IProduct } from "@/types/type";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchProducts } from "@/redux/features/prodect/prodectSlice";
import { useEffect, useState } from "react";

export default function OurProductList({ t, locale }: { t: any; locale: string }) {
  const products = useAppSelector((state) => state.products.products);
  const status = useAppSelector((state) => state.products.status);
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        await dispatch(fetchProducts({ applyFilters: false })).unwrap();
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [dispatch]);

  return (
    <div className="flex flex-col items-start w-full my-6 md:my-10">
      {/* Grid with Product Cards - make it responsive */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-[30px] justify-items-center">
        {isLoading || status === "loading" ? (
          // Skeletons during loading
          Array(8).fill(0).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))
        ) : (
          // Products after loading
          products.slice(0, 8).map((product: IProduct) => (
            <ProductCard key={product._id} product={product} />
          ))
        )}
      </div>
      
      {/* View All button if needed */}
      <div className="flex justify-center w-full mt-8 md:mt-10">
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
