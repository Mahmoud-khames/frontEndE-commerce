"use client";
import React, { useState, useEffect } from "react";
import Slider from "../../Slider";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchCategories } from "@/redux/features/category/categorySlice";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";

export default function CategoriesList() {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { categories, loading } = useAppSelector((state) => state.category);
  const apiURL = process.env.NEXT_PUBLIC_API_URL;
  const { locale } = useParams();
  const isMobile = useIsMobile();

  useEffect(() => {
    dispatch(fetchCategories())
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false));
  }, [dispatch]);

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/${locale}/products?categories=${categoryId}`);
  };

  return (
    <div className="w-full overflow-x-auto py-4">
      <Slider
        className="pb-6" // Add padding to accommodate pagination dots
        slidesPerView={2.2}
        breakpoints={{
          480: { slidesPerView: 3.2 },
          640: { slidesPerView: 4.2 },
          768: { slidesPerView: 5.2 },
          1024: { slidesPerView: 6.2 },
        }}
      >
        {isLoading ? (
          // Skeletons for loading state
          Array(6).fill(0).map((_, index) => (
            <div key={index} className="flex-shrink-0 w-[100px] md:w-[150px] h-[90px] md:h-[130px]">
              <Skeleton className="w-full h-full rounded-lg" />
            </div>
          ))
        ) : (
          // Categories from backend
          categories.map((category) => (
            <div
              key={category._id}
              onClick={() => handleCategoryClick(category._id)}
              className="flex flex-col text-black items-center justify-center gap-1 md:gap-4 w-[100px] sm:w-[120px] md:w-[150px] lg:w-[170px] h-[90px] sm:h-[100px] md:h-[130px] lg:h-[145px] border border-gray-200 rounded-lg hover:border-secondary hover:bg-secondary hover:text-white transition-all duration-300 cursor-pointer relative group flex-shrink-0"
            >
              {category.image && (
                <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 lg:w-14 lg:h-14">
                  <Image 
                    src={`${apiURL}${category.image}`}
                    alt={category.name}
                    width={isMobile ? 24 : 56}
                    height={isMobile ? 24 : 56}
                    className="object-contain"
                  />
                </div>
              )}
              <p className="text-xs sm:text-sm md:text-base font-medium text-center px-2">{category.name}</p>
            </div>
          ))
        )}
      </Slider>
    </div>
  );
}
