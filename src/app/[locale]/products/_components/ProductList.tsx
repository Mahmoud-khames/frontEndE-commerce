"use client";

import React, { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import {
  fetchProducts,
  setFilters,
  searchProducts,
} from "@/redux/features/prodect/prodectSlice";
import ProductCard from "@/components/ProductCard";
import { Pagination } from "@/components/ui/pagination";
import { Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { debounce } from 'lodash';
export default function ProductList({ t, locale }: { t: any; locale: string }) {
  const dispatch = useAppDispatch();
  const { products, loading, filters, availableFilters, pagination, noProduct } =
    useAppSelector((state) => state.products);

  // Local state for search and sort
  const [searchTerm, setSearchTerm] = useState(filters?.search || "");
  const [sortOption, setSortOption] = useState(filters?.sort || "newest");

  // Update local state when filters change
  useEffect(() => {
    setSearchTerm(filters?.search || "");
    setSortOption(filters?.sort || "newest");
  }, [filters]);

  // Fetch products with current filters
  useEffect(() => {
    const search = filters?.search;
    
    if (search) {
      // If there's a search term, use the dedicated search action
      console.log("ProductList: Searching for:", search);
      dispatch(searchProducts(search));
    } else {
      // Otherwise fetch with regular filters
      dispatch(fetchProducts({ applyFilters: true }));
    }
  }, [dispatch, filters]);

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      console.log("Search submitted:", searchTerm);
      dispatch(setFilters({ search: searchTerm, page: 1 }));
      // Directly dispatch search to ensure it happens immediately
      dispatch(searchProducts(searchTerm));
    } else if (filters?.search) {
      // If search term is empty but there was a previous search, clear it
      dispatch(setFilters({ search: undefined, page: 1 }));
      dispatch(fetchProducts({ applyFilters: true }));
    }
  };

  // Handle search input change with debounce
  const debouncedClearSearch = debounce(() => {
    dispatch(setFilters({ search: undefined, page: 1 }));
  }, 300);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value === "" && filters?.search) {
      debouncedClearSearch();
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    dispatch(setFilters({ page }));
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters?.categories) count++;
    if (filters?.colors) count++;
    if (filters?.sizes) count++;
    if (filters?.discount === "true") count++;
    if (filters?.new === "true") count++;
    if (filters?.inStock === "true") count++;
    if (
      availableFilters?.priceRange &&
      (filters?.minPrice !== availableFilters.priceRange.min ||
        filters?.maxPrice !== availableFilters.priceRange.max)
    )
      count++;
    if (filters?.search) count++;
    return count;
  };

  return (
    <div className="w-full">
      {/* Top filter bar - responsive layout */}
      <div className="sticky top-0 z-10 bg-white border-b mb-3 sm:mb-4 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2">
        {/* Search form */}
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[150px] sm:min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t.products.searchPlaceholder}
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-8 w-full text-sm sm:text-base"
            />
            {searchTerm && (
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
                onClick={() => {
                  setSearchTerm("");
                  if (filters?.search) {
                    dispatch(setFilters({ search: undefined, page: 1 }));
                  }
                }}
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button type="submit" className="sr-only">Search</button>
          </div>
        </form>

        {/* Sort dropdown - full width on mobile, auto width on larger screens */}
        <div className="w-full sm:w-auto mt-2 sm:mt-0">
          <Select
            value={sortOption}
            onValueChange={(value) => {
              setSortOption(value);
              dispatch(setFilters({ sort: value }));
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px] text-sm sm:text-base">
              <SelectValue placeholder={t.products.sort} />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="newest" className="hover:bg-secondary hover:!text-white text-sm sm:text-base">{t.products.sortNewest}</SelectItem>
              <SelectItem value="price-asc" className="hover:bg-secondary hover:!text-white text-sm sm:text-base">
                {t.products.sortPriceAsc}
              </SelectItem>
              <SelectItem value="price-desc" className="hover:bg-secondary hover:!text-white text-sm sm:text-base">
                {t.products.sortPriceDesc}
              </SelectItem>
              <SelectItem value="name-asc" className="hover:bg-secondary hover:!text-white text-sm sm:text-base">{t.products.sortNameAsc}</SelectItem>
              <SelectItem value="name-desc" className="hover:bg-secondary hover:!text-white text-sm sm:text-base">
                {t.products.sortNameDesc}
              </SelectItem>
              <SelectItem value="discount" className="hover:bg-secondary hover:!text-white text-sm sm:text-base">
                {t.products.sortDiscount}
              </SelectItem>
              <SelectItem value="popular" className="hover:bg-secondary hover:!text-white text-sm sm:text-base">{t.products.sortPopular}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active filters display - scrollable on mobile */}
      {getActiveFilterCount() > 0 && (
        <div className="mb-3 sm:mb-4 flex flex-wrap gap-1 sm:gap-2 items-center overflow-x-auto pb-2">
          <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
            {t.products.activeFilters}:
          </span>

          {/* Filter tags - made smaller on mobile */}
          {/* Price filter tag */}
          {filters?.minPrice !== undefined &&
            filters?.maxPrice !== undefined &&
            availableFilters?.priceRange &&
            (filters.minPrice > availableFilters.priceRange.min ||
              filters.maxPrice < availableFilters.priceRange.max) && (
              <div className="bg-gray-100 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm flex items-center gap-1 whitespace-nowrap">
                <span>
                  {t.products.price}: ${filters.minPrice} - ${filters.maxPrice}
                </span>
                <button
                  className="ml-1 text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    dispatch(
                      setFilters({
                        minPrice: availableFilters?.priceRange?.min,
                        maxPrice: availableFilters?.priceRange?.max,
                      })
                    );
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

          {/* Search filter tag */}
          {filters?.search && (
            <div className="bg-gray-100 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm flex items-center gap-1 whitespace-nowrap">
              <span>
                {t.products.search}: {filters.search}
              </span>
              <button
                className="ml-1 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setSearchTerm("");
                  dispatch(setFilters({ search: undefined }));
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Category filter tag */}
          {filters?.categories && (
            <div className="bg-gray-100 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm flex items-center gap-1 whitespace-nowrap">
              <span>{t.products.categories}</span>
              <button
                className="ml-1 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  dispatch(setFilters({ categories: undefined }));
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Color filter tag */}
          {filters?.colors && (
            <div className="bg-gray-100 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm flex items-center gap-1 whitespace-nowrap">
              <span>{t.products.colors}</span>
              <button
                className="ml-1 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  dispatch(setFilters({ colors: undefined }));
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Size filter tag */}
          {filters?.sizes && (
            <div className="bg-gray-100 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm flex items-center gap-1 whitespace-nowrap">
              <span>{t.products.sizes}</span>
              <button
                className="ml-1 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  dispatch(setFilters({ sizes: undefined }));
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Discount filter tag */}
          {filters?.discount === "true" && (
            <div className="bg-gray-100 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm flex items-center gap-1 whitespace-nowrap">
              <span>{t.products.onSale}</span>
              <button
                className="ml-1 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  dispatch(setFilters({ discount: undefined }));
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* New filter tag */}
          {filters?.new === "true" && (
            <div className="bg-gray-100 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm flex items-center gap-1 whitespace-nowrap">
              <span>{t.products.newArrivals}</span>
              <button
                className="ml-1 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  dispatch(setFilters({ new: undefined }));
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* In Stock filter tag */}
          {filters?.inStock === "true" && (
            <div className="bg-gray-100 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm flex items-center gap-1 whitespace-nowrap">
              <span>{t.products.inStock}</span>
              <button
                className="ml-1 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  dispatch(setFilters({ inStock: undefined }));
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading indicator */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px] sm:min-h-[300px] md:min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          {/* Products grid - responsive columns */}
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  locale={locale}
                  t={t}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 sm:py-16 md:py-20">
              <p className="text-sm sm:text-base text-gray-500">{t.products.noProductsFound}</p>
              {noProduct && filters?.search && (
                <p className="text-sm sm:text-base text-gray-500 mt-2">
                  {t.products.noProductsFoundForSearch}: "{filters.search}"
                </p>
              )}
            </div>
          )}

          {/* Pagination - make it responsive */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 sm:mt-8 flex justify-center">
              <Pagination
                currentPage={pagination.currentPage}
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






