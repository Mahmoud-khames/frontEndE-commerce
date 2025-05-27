"use client";
import Link from "@/components/link";
import ProductCard, { ProductCardSkeleton } from "../../ProductCard";
import { IProduct } from "@/types/type";
import { useState, useEffect } from "react";
import axios from "axios";

export default function DiscountedProductsList({ t, locale }: { t: any; locale: string }) {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchDiscountedProducts = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${apiURL}/api/product/discounted`);
        if (response.data.success) {
          setProducts(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching discounted products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscountedProducts();
  }, [apiURL]);

  if (products.length === 0 && !isLoading) {
    return null; // لا تعرض القسم إذا لم تكن هناك منتجات بخصم
  }

  return (
    <div className="w-full my-6 md:my-10">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">{t.home.discountedProducts}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-[30px] justify-items-center">
        {isLoading ? (
          // Skeletons during loading
          Array(4).fill(0).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))
        ) : (
          // Products after loading
          products.slice(0, 4).map((product: IProduct) => (
            <ProductCard key={product._id} product={product} />
          ))
        )}
      </div>
      
      {/* View All button if needed */}
      {products.length > 4 && (
        <div className="flex justify-center w-full mt-8 md:mt-10">
          <Link
            href={`/${locale}/products?discounted=true`}
            className="bg-secondary text-white px-6 md:px-8 py-2.5 md:py-3 rounded text-sm md:text-base font-medium hover:bg-[#c13535] transition-colors cursor-pointer"
          >
            {t.home.viewAll}
          </Link>
        </div>
      )}
    </div>
  );
}
