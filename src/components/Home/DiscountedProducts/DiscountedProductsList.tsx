"use client";
import Link from "@/components/link";
import ProductCard, { ProductCardSkeleton } from "../../ProductCard";
import { Product } from "@/types";
import { useDiscountedProducts } from "@/hooks/useProducts";

export default function DiscountedProductsList({
  t,
  locale,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  locale: string;
}) {
  const { data: response, isLoading } = useDiscountedProducts();
  const products = (response?.data as unknown as Product[]) || [];

  if (products.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="w-full my-6 md:my-10">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
        {t.home?.discountedProducts || "Discounted Products"}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-[30px] justify-items-center">
        {isLoading
          ? // Skeletons during loading
            Array(4)
              .fill(0)
              .map((_, index) => <ProductCardSkeleton key={index} />)
          : // Products after loading
            products
              .slice(0, 4)
              .map((product: Product) => (
                <ProductCard key={product._id} product={product} t={t} />
              ))}
      </div>

      {/* View All button */}
      {products.length > 4 && (
        <div className="flex justify-center w-full mt-8 md:mt-10">
          <Link
            href={`/${locale}/products?discounted=true`}
            className="bg-secondary text-white px-6 md:px-8 py-2.5 md:py-3 rounded text-sm md:text-base font-medium hover:bg-[#c13535] transition-colors cursor-pointer"
          >
            {t.home?.viewAll || "View All"}
          </Link>
        </div>
      )}
    </div>
  );
}
