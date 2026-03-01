"use client";
import Link from "@/components/link";
import ProductCard, { ProductCardSkeleton } from "../../ProductCard";
import { Product } from "@/types";
import { useBestSellingProducts, useProducts } from "@/hooks/useProducts";

export default function ProductList({
  t,
  locale,
  filter = {},
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  locale: string;
  filter?: { bestSelling?: boolean };
}) {
  // Always call hooks unconditionally
  const { data: bestSellingData, isLoading: bestSellingLoading } =
    useBestSellingProducts(4);
  const { data: generalData, isLoading: generalLoading } = useProducts({
    limit: 4,
  });

  // Select data based on filter
  const isBestSelling = filter?.bestSelling;
  const products = isBestSelling
    ? (bestSellingData?.data as unknown as Product[]) || []
    : (generalData?.data as unknown as Product[]) || [];

  const isLoading = isBestSelling ? bestSellingLoading : generalLoading;

  return (
    <div className="w-full">
      {/* Responsive grid for products */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-[30px] justify-items-center">
        {isLoading
          ? // Skeletons during loading
            Array(4)
              .fill(0)
              .map((_, index) => <ProductCardSkeleton key={index} />)
          : // Products after loading
            products.map((product: Product) => (
              <ProductCard key={product._id} product={product} t={t} />
            ))}
      </div>

      {/* View All button - make it responsive */}
      <div className="flex justify-center w-full mt-8 md:mt-10">
        <Link
          href={`/${locale}/products`}
          className="bg-secondary text-white px-6 md:px-8 py-2.5 md:py-3 rounded text-sm md:text-base font-medium hover:bg-[#c13535] transition-colors cursor-pointer"
        >
          {t.home?.viewAll || "View All"}
        </Link>
      </div>
    </div>
  );
}
