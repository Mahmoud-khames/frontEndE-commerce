// components/Home/Categories/CategoriesList.tsx
"use client";

import React from "react";
import Slider from "../../Slider";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";

export default function CategoriesList() {
  const router = useRouter();
  const { data: response, isLoading, error } = useCategories();
  const categories = response?.data;
  const { locale } = useParams();
  const isMobile = useIsMobile();

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/${locale}/products?categories=${categoryId}`);
  };

  if (error) {
    return (
      <div className="w-full py-8 text-center text-gray-400">
        {locale === "ar" ? "حدث خطأ في تحميل الفئات" : "Error loading categories"}
      </div>
    );
  }

  if (!isLoading && (!categories || categories.length === 0)) {
    return (
      <div className="w-full py-8 text-center text-gray-400">
        {locale === "ar" ? "لا توجد فئات متاحة" : "No categories available"}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto py-4">
      <Slider
        className="pb-6"
        slidesPerView={2.2}
        spaceBetween={15}
        breakpoints={{
          480: { slidesPerView: 3.2, spaceBetween: 15 },
          640: { slidesPerView: 4.2, spaceBetween: 20 },
          768: { slidesPerView: 5.2, spaceBetween: 20 },
          1024: { slidesPerView: 6.2, spaceBetween: 25 },
        }}
      >
        {isLoading
          ? Array(6)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-[120px] md:w-[170px] h-[100px] md:h-[145px]"
                >
                  <Skeleton className="w-full h-full rounded-lg" />
                </div>
              ))
          : categories?.map((category) => (
              <div
                key={category._id}
                onClick={() => handleCategoryClick(category._id)}
                className="flex flex-col text-black items-center justify-center gap-2 md:gap-4 
                w-[120px] md:w-[170px] h-[100px] md:h-[145px] 
                border-2 border-gray-200 rounded-lg 
                hover:border-secondary hover:bg-secondary hover:text-white 
                transition-all duration-300 cursor-pointer 
                flex-shrink-0 group
                hover:scale-105 active:scale-95
                hover:shadow-lg"
              >
                {category.image && (
                  <div className="flex items-center justify-center w-8 h-8 md:w-14 md:h-14 transition-transform group-hover:scale-110">
                    <Image
                      src={category.image}
                      alt={category.nameEn}
                      width={isMobile ? 32 : 56}
                      height={isMobile ? 32 : 56}
                      className="object-contain"
                    />
                  </div>
                )}
                <p className="text-xs md:text-base font-medium text-center px-2 line-clamp-2">
                  {locale === "en" ? category.nameEn : category.nameAr}
                </p>
              </div>
            ))}
      </Slider>
    </div>
  );
}