"use client";
import Link from "@/components/link";
import ProductCard, { ProductCardSkeleton } from "../../ProductCard";
import { IProduct } from "@/types/type";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchProducts } from "@/redux/features/prodect/prodectSlice";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ProductList({ t, locale, filter = {} }: { 
  t: any; 
  locale: string;
  filter?: { bestSelling?: boolean }
}) {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const apiURL = process.env.NEXT_PUBLIC_API_URL;
  const { status } = useAppSelector((state) => state.products);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        // Use the best selling endpoint if bestSelling is true
        const endpoint = filter?.bestSelling 
          ? `${apiURL}/api/product/bestselling` 
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
  }, [apiURL, filter?.bestSelling]);

  return (
    <div className="w-full">
      {/* Responsive grid for products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-[30px] justify-items-center">
        {isLoading || status === "loading" ? (
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
      
      {/* View All button - make it responsive */}
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
