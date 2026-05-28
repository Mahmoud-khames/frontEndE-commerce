// components/Home/Categories/CategoriesList.tsx
"use client";

import React from "react";
import Slider from "../../Slider";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { getCategoryName } from "@/lib/localized";

export default function CategoriesList() {
  const { data: response, isLoading, error } = useCategories();
  const categories = response?.data;
  const { locale } = useParams();
  const isMobile = useIsMobile();

  const getCategoryHref = (categoryId: string) => {
    const params = new URLSearchParams({
      categories: categoryId,
      page: "1",
    });

    return `/${locale}/products?${params.toString()}`;
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
    <div className="w-full py-4">
      <Slider
        className="pb-4 md:pb-6"
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
                  className="snap-start flex-shrink-0 w-[128px] sm:w-[150px] lg:w-[178px] h-[108px] sm:h-[128px] lg:h-[148px]"
                >
                  <Skeleton className="w-full h-full rounded-md" />
                </div>
              ))
          : categories?.map((category) => (
              <Link
                key={category._id}
                href={getCategoryHref(category._id)}
                className="flex flex-col text-black items-center justify-center gap-2 md:gap-4 
                w-[128px] sm:w-[150px] lg:w-[178px] h-[108px] sm:h-[128px] lg:h-[148px]
                border border-gray-200 rounded-md bg-white
                hover:border-secondary hover:bg-secondary hover:text-white
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary
                transition-all duration-200 cursor-pointer
                flex-shrink-0 snap-start group
                active:scale-[0.98]
                hover:shadow-md"
                aria-label={`${
                  locale === "ar" ? "عرض منتجات" : "View products in"
                } ${getCategoryName(category, String(locale))}`}
              >
                {category.image && (
                  <div className="flex items-center justify-center w-9 h-9 md:w-14 md:h-14 transition-transform group-hover:scale-105">
                    <Image
                      src={category.image}
                      alt={getCategoryName(category, String(locale))}
                      width={isMobile ? 32 : 56}
                      height={isMobile ? 32 : 56}
                      className="object-contain"
                    />
                  </div>
                )}
                <p className="text-xs md:text-base font-medium text-center px-2 line-clamp-2">
                  {getCategoryName(category, String(locale))}
                </p>
              </Link>
            ))}
      </Slider>
    </div>
  );
}
