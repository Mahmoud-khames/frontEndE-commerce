// app/[locale]/products/_components/ProductList.tsx
"use client";

import React, { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { Pagination } from "@/components/ui/pagination";
import { Loader2, Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAvailableFilters, useFilterProducts } from "@/hooks/useProducts";
import { Product } from "@/types";
import { ProductFilters as ProductFiltersType } from "@/types";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import EnhancedSearchBar from "@/components/search/EnhancedSearchBar";

export default function ProductList({ t, locale }: { t: any; locale: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isRTL = locale === "ar";

  // Parse filters from URL
  const filters: ProductFiltersType = {
    page: Number(searchParams.get("page")) || 1,
    limit: 12,
    sort: (searchParams.get("sort") as ProductFiltersType["sort"]) || "newest",
    search: searchParams.get("search") || undefined,
    categories: searchParams.get("categories") || undefined,
    colors: searchParams.get("colors") || undefined,
    sizes: searchParams.get("sizes") || undefined,
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
    discount: searchParams.get("discount") === "true",
    new: searchParams.get("new") === "true",
    inStock: searchParams.get("inStock") === "true",
  };

  // React Query Hooks
  const { data: response, isLoading: loading } = useFilterProducts(filters);
  const { data: availableFiltersResponse } = useAvailableFilters();

  const products = (response?.data as unknown as Product[]) || [];
  const pagination = response?.pagination;
  const availableFilters = availableFiltersResponse?.filters;

  // Helpers to update URL
  const updateURL = (newParams: Record<string, string | undefined | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    updateURL({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.categories) count++;
    if (filters.colors) count++;
    if (filters.sizes) count++;
    if (filters.discount) count++;
    if (filters.new) count++;
    if (filters.inStock) count++;
    if (
      availableFilters?.priceRange &&
      (filters.minPrice !== undefined || filters.maxPrice !== undefined) &&
      (filters.minPrice !== availableFilters.priceRange.min ||
        filters.maxPrice !== availableFilters.priceRange.max)
    ) {
      count++;
    }
    if (filters.search) count++;
    return count;
  };

  return (
    <div className="w-full">
      {/* Top filter bar with Enhanced Search */}
      <div
        className="sticky top-16 sm:top-20 z-30 bg-white border-b mb-4 sm:mb-6 p-3 sm:p-4 shadow-sm"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
          {/* Enhanced Search Bar */}
          <div className="flex-1 min-w-0">
            <EnhancedSearchBar t={t} locale={locale} variant="default" />
          </div>

          {/* Sort dropdown */}
          <div className="w-full sm:w-auto sm:min-w-[200px]">
            <Select
              value={filters.sort || "newest"}
              onValueChange={(value) => {
                updateURL({ sort: value });
              }}
            >
              <SelectTrigger className="w-full text-sm sm:text-base h-10">
                <SelectValue placeholder={t.products?.sort || "Sort by"} />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem
                  value="newest"
                  className="hover:bg-secondary hover:!text-white text-sm sm:text-base"
                >
                  {t.products?.sortNewest || "Newest"}
                </SelectItem>
                <SelectItem
                  value="price-asc"
                  className="hover:bg-secondary hover:!text-white text-sm sm:text-base"
                >
                  {t.products?.sortPriceAsc || "Price: Low to High"}
                </SelectItem>
                <SelectItem
                  value="price-desc"
                  className="hover:bg-secondary hover:!text-white text-sm sm:text-base"
                >
                  {t.products?.sortPriceDesc || "Price: High to Low"}
                </SelectItem>
                <SelectItem
                  value="name-asc"
                  className="hover:bg-secondary hover:!text-white text-sm sm:text-base"
                >
                  {t.products?.sortNameAsc || "Name: A to Z"}
                </SelectItem>
                <SelectItem
                  value="name-desc"
                  className="hover:bg-secondary hover:!text-white text-sm sm:text-base"
                >
                  {t.products?.sortNameDesc || "Name: Z to A"}
                </SelectItem>
                <SelectItem
                  value="discount"
                  className="hover:bg-secondary hover:!text-white text-sm sm:text-base"
                >
                  {t.products?.sortDiscount || "Biggest Discount"}
                </SelectItem>
                <SelectItem
                  value="popular"
                  className="hover:bg-secondary hover:!text-white text-sm sm:text-base"
                >
                  {t.products?.sortPopular || "Most Popular"}
                </SelectItem>
                <SelectItem
                  value="rating"
                  className="hover:bg-secondary hover:!text-white text-sm sm:text-base"
                >
                  {t.products?.sortRating || "Highest Rated"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Active filters display */}
      {getActiveFilterCount() > 0 && (
        <div
          className="mb-4 sm:mb-6 flex flex-wrap gap-2 items-center px-3 sm:px-4"
          dir={isRTL ? "rtl" : "ltr"}
        >
          <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
            {t.products?.activeFilters || "Active Filters"}:
          </span>

          {/* Search filter tag */}
          {filters.search && (
            <div className="bg-primary/10 rounded-full px-3 py-1 text-xs sm:text-sm flex items-center gap-1 whitespace-nowrap">
              <span className="text-primary font-medium">
                {t.products?.search || "Search"}: {filters.search}
              </span>
              <button
                className="ml-1 text-primary/60 hover:text-primary transition-colors"
                onClick={() => {
                  updateURL({ search: undefined });
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Price filter tag */}
          {(filters.minPrice !== undefined ||
            filters.maxPrice !== undefined) && (
            <div className="bg-gray-100 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm flex items-center gap-1 whitespace-nowrap">
              <span>
                {t.products?.price || "Price"}: ${filters.minPrice || 0} - $
                {filters.maxPrice || "Max"}
              </span>
              <button
                className="ml-1 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  updateURL({ minPrice: undefined, maxPrice: undefined });
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Category filter tag */}
          {filters.categories && (
            <div className="bg-gray-100 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm flex items-center gap-1 whitespace-nowrap">
              <span>{t.products?.categories || "Categories"}</span>
              <button
                className="ml-1 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  updateURL({ categories: undefined });
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Colors filter tag */}
          {filters.colors && (
            <div className="bg-gray-100 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm flex items-center gap-1 whitespace-nowrap">
              <span>{t.products?.colors || "Colors"}</span>
              <button
                className="ml-1 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  updateURL({ colors: undefined });
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Sizes filter tag */}
          {filters.sizes && (
            <div className="bg-gray-100 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm flex items-center gap-1 whitespace-nowrap">
              <span>{t.products?.sizes || "Sizes"}</span>
              <button
                className="ml-1 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  updateURL({ sizes: undefined });
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Discount filter tag */}
          {filters.discount && (
            <div className="bg-red-100 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm flex items-center gap-1 whitespace-nowrap">
              <span className="text-red-700">
                {t.products?.onSale || "On Sale"}
              </span>
              <button
                className="ml-1 text-red-500 hover:text-red-700"
                onClick={() => {
                  updateURL({ discount: undefined });
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* New arrivals filter tag */}
          {filters.new && (
            <div className="bg-green-100 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm flex items-center gap-1 whitespace-nowrap">
              <span className="text-green-700">
                {t.products?.newArrivals || "New"}
              </span>
              <button
                className="ml-1 text-green-500 hover:text-green-700"
                onClick={() => {
                  updateURL({ new: undefined });
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* In stock filter tag */}
          {filters.inStock && (
            <div className="bg-blue-100 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm flex items-center gap-1 whitespace-nowrap">
              <span className="text-blue-700">
                {t.products?.inStock || "In Stock"}
              </span>
              <button
                className="ml-1 text-blue-500 hover:text-blue-700"
                onClick={() => {
                  updateURL({ inStock: undefined });
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Clear all filters */}
          <button
            className="text-xs sm:text-sm text-secondary hover:underline ml-2 font-medium"
            onClick={() => {
              router.push(`${pathname}`);
            }}
          >
            {t.products?.clearAll || "Clear All"}
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Products grid */}
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 justify-items-center px-3 sm:px-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} t={t} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 md:py-32">
              <div className="flex flex-col items-center gap-6 max-w-lg mx-auto px-4">
                <div className="bg-gray-100 p-6 rounded-full">
                  <Search className="h-10 w-10 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-900">
                    {t.search?.noResults ||
                      (isRTL ? "لم يتم العثور على نتائج" : "No results found")}
                  </h3>
                  <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                    {filters.search ? (
                      <>
                        {isRTL
                          ? `لم نجد أي منتجات تطابق "${filters.search}". جرب استخدام كلمات مختلفة أو أكثر عامة.`
                          : `We couldn't find any products matching "${filters.search}". Try using different or more general keywords.`}
                      </>
                    ) : (
                      <>
                        {isRTL
                          ? "لم نجد منتجات تطابق الفلاتر المحددة. جرب إزالة بعض الفلاتر."
                          : "We couldn't find products matching the selected filters. Try removing some filters."}
                      </>
                    )}
                  </p>
                </div>

                {filters.search && (
                  <button
                    onClick={() => updateURL({ search: undefined })}
                    className="mt-4 px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-all shadow-sm ring-4 ring-primary/10"
                  >
                    {t.search?.viewAllResults ||
                      (isRTL ? "عرض كل المنتجات" : "View all products")}
                  </button>
                )}

                {/* Search Tips or Suggestions could go here */}
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 sm:mt-8 flex justify-center">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
