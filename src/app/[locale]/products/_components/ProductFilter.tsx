"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, X } from "lucide-react";
import { useAvailableFilters } from "@/hooks/useProducts";
import { ProductFilters as ProductFiltersType } from "@/types";
import { getCategoryName } from "@/lib/localized";

export default function ProductFilter({
  t,
  locale,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  locale: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: availableFiltersResponse } = useAvailableFilters();
  const availableFilters = availableFiltersResponse?.filters;

  // State for mobile filter visibility
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // States for filter values
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [onSale, setOnSale] = useState(false);
  const [newArrivals, setNewArrivals] = useState(false);
  const [inStock, setInStock] = useState(false);
  const isRTL = locale === "ar";
  const filterLocale = locale === "ar" ? "ar" : "en";

  // Initialize filter states from URL params
  useEffect(() => {
    // Set price range
    if (availableFilters?.priceRange) {
      const minParam = searchParams.get("minPrice");
      const maxParam = searchParams.get("maxPrice");

      const min = minParam
        ? Number(minParam)
        : availableFilters.priceRange.min;
      const max = maxParam
        ? Number(maxParam)
        : availableFilters.priceRange.max;
      setPriceRange([min, max]);
    }

    // Set categories
    const categoriesParam = searchParams.get("categories");
    if (categoriesParam) {
      setSelectedCategories(categoriesParam.split(","));
    } else {
      setSelectedCategories([]);
    }

    // Set colors
    const colorsParam = searchParams.get("colors");
    if (colorsParam) {
      setSelectedColors(colorsParam.split(","));
    } else {
      setSelectedColors([]);
    }

    // Set sizes
    const sizesParam = searchParams.get("sizes");
    if (sizesParam) {
      setSelectedSizes(sizesParam.split(","));
    } else {
      setSelectedSizes([]);
    }

    // Set other filters
    setOnSale(searchParams.get("discount") === "true");
    setNewArrivals(searchParams.get("new") === "true");
    setInStock(searchParams.get("inStock") === "true");
  }, [availableFilters, searchParams]);

  // Handle price input changes
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!isNaN(value)) {
      setPriceRange([value, priceRange[1]]);
    }
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!isNaN(value)) {
      setPriceRange([priceRange[0], value]);
    }
  };

  const normalizedPriceRange = useMemo<[number, number]>(() => {
    if (!availableFilters?.priceRange) return priceRange;

    const min = Math.max(
      availableFilters.priceRange.min,
      Math.min(priceRange[0], availableFilters.priceRange.max)
    );
    const max = Math.max(
      min,
      Math.min(priceRange[1], availableFilters.priceRange.max)
    );

    return [min, max];
  }, [availableFilters?.priceRange, priceRange]);

  const availableColors = useMemo(
    () =>
      availableFilters?.colors?.[filterLocale] ||
      availableFilters?.colors?.en ||
      [],
    [availableFilters?.colors, filterLocale]
  );

  const availableSizes = useMemo(
    () =>
      availableFilters?.sizes?.[filterLocale] ||
      availableFilters?.sizes?.en ||
      [],
    [availableFilters?.sizes, filterLocale]
  );

  const activeFilterCount = useMemo(() => {
    const hasCustomPrice =
      availableFilters?.priceRange &&
      (normalizedPriceRange[0] !== availableFilters.priceRange.min ||
        normalizedPriceRange[1] !== availableFilters.priceRange.max);

    return (
      selectedCategories.length +
      selectedColors.length +
      selectedSizes.length +
      (onSale ? 1 : 0) +
      (newArrivals ? 1 : 0) +
      (inStock ? 1 : 0) +
      (hasCustomPrice ? 1 : 0)
    );
  }, [
    availableFilters?.priceRange,
    inStock,
    newArrivals,
    normalizedPriceRange,
    onSale,
    selectedCategories.length,
    selectedColors.length,
    selectedSizes.length,
  ]);

  const getColorPreview = (color: string) => {
    const normalized = color.trim().toLowerCase();
    const colorMap: Record<string, string> = {
      أحمر: "red",
      ازرق: "blue",
      أزرق: "blue",
      اخضر: "green",
      أخضر: "green",
      اسود: "black",
      أسود: "black",
      ابيض: "white",
      أبيض: "white",
      اصفر: "yellow",
      أصفر: "yellow",
      رمادي: "gray",
      وردي: "pink",
      بني: "brown",
      برتقالي: "orange",
      بنفسجي: "purple",
    };

    return colorMap[color] || normalized;
  };

  // Toggle category selection
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Toggle color selection
  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  // Toggle size selection
  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // Apply filters
  const handleApplyFilters = () => {
    // Create new URLSearchParams
    const params = new URLSearchParams(searchParams.toString());

    // Set price range
    if (availableFilters?.priceRange) {
      if (normalizedPriceRange[0] !== availableFilters.priceRange.min) {
        params.set("minPrice", normalizedPriceRange[0].toString());
      } else {
        params.delete("minPrice");
      }

      if (normalizedPriceRange[1] !== availableFilters.priceRange.max) {
        params.set("maxPrice", normalizedPriceRange[1].toString());
      } else {
        params.delete("maxPrice");
      }
    }

    // Set categories
    if (selectedCategories.length > 0) {
      params.set("categories", selectedCategories.join(","));
    } else {
      params.delete("categories");
    }

    // Set colors
    if (selectedColors.length > 0) {
      params.set("colors", selectedColors.join(","));
    } else {
      params.delete("colors");
    }

    // Set sizes
    if (selectedSizes.length > 0) {
      params.set("sizes", selectedSizes.join(","));
    } else {
      params.delete("sizes");
    }

    // Set other filters
    if (onSale) {
      params.set("discount", "true");
    } else {
      params.delete("discount");
    }

    if (newArrivals) {
      params.set("new", "true");
    } else {
      params.delete("new");
    }

    if (inStock) {
      params.set("inStock", "true");
    } else {
      params.delete("inStock");
    }

    // Reset page to 1
    params.set("page", "1");

    // Update URL
    router.push(`${pathname}?${params.toString()}`);

    // Close mobile filters
    setMobileFiltersOpen(false);
  };

  // Reset filters
  const handleResetFilters = () => {
    // Reset all state
    if (availableFilters?.priceRange) {
      setPriceRange([
        availableFilters.priceRange.min,
        availableFilters.priceRange.max,
      ]);
    }
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setOnSale(false);
    setNewArrivals(false);
    setInStock(false);

    // Clear URL params except search
    const params = new URLSearchParams();
    const search = searchParams.get("search");
    if (search) {
      params.set("search", search);
    }
    // Also keep sort if desired, or reset it. Keeping sort is user friendly.
    const sort = searchParams.get("sort");
    if (sort) {
      params.set("sort", sort);
    }

    // Update URL
    router.push(`${pathname}?${params.toString()}`);
  };

  if (!availableFilters) {
    // Return skeleton or null while loading available filters
    // For now just return null or maybe the container structure
    return (
      <div
        className="p-3 sm:p-4 border rounded-lg bg-white space-y-4 sm:space-y-6"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 border rounded-md bg-white space-y-4 sm:space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-base sm:text-lg">
          {t.products.filter}
          {activeFilterCount > 0 && (
            <span className="mx-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1.5 text-xs font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </h2>

        {/* Mobile filter toggle button - only visible on small screens */}
        <button
          className="lg:hidden text-sm bg-gray-100 px-3 py-2 rounded-md flex items-center gap-2"
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          aria-expanded={mobileFiltersOpen}
        >
          {mobileFiltersOpen ? (
            <>
              <X size={16} /> {t.products.hideFilters}
            </>
          ) : (
            <>
              <Filter size={16} />
              {t.products.filter}
            </>
          )}
        </button>
      </div>

      {/* Mobile filter overlay */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileFiltersOpen(false)}
        ></div>
      )}

      {/* Filter content - collapsible on mobile */}
      <div
        className={`lg:space-y-5 ${
          mobileFiltersOpen
            ? `fixed inset-y-0 ${
                isRTL ? "right-0" : "left-0"
              } w-[85%] max-w-sm bg-white z-50 p-4 overflow-y-auto transform transition-transform duration-300 translate-x-0 shadow-2xl`
            : "hidden lg:block lg:space-y-5"
        }`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Mobile filter header */}
        {mobileFiltersOpen && (
          <div className="flex justify-between items-center mb-4 pb-2 border-b lg:hidden">
            <h2 className="font-semibold text-lg">{t.products.filter}</h2>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Price Range */}
        {availableFilters?.priceRange && (
          <div className="space-y-2 sm:space-y-3 mb-4">
            <h3 className="font-medium text-sm sm:text-base">
              {t.products.priceRange}
            </h3>
            <div className="px-2">
              <Slider
                value={priceRange}
                min={availableFilters.priceRange.min}
                max={availableFilters.priceRange.max}
                step={1}
                onValueChange={(value) =>
                  setPriceRange(value as [number, number])
                }
                className="my-4 sm:my-6"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-500">
                  {t.products.from}
                </label>
                <Input
                  type="number"
                  value={priceRange[0]}
                  onChange={handleMinPriceChange}
                  min={availableFilters.priceRange.min}
                  max={normalizedPriceRange[1]}
                  onBlur={() => setPriceRange(normalizedPriceRange)}
                  className="mt-1 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500">{t.products.to}</label>
                <Input
                  type="number"
                  value={priceRange[1]}
                  onChange={handleMaxPriceChange}
                  min={normalizedPriceRange[0]}
                  max={availableFilters.priceRange.max}
                  onBlur={() => setPriceRange(normalizedPriceRange)}
                  className="mt-1 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Categories */}
        {availableFilters?.categories &&
          availableFilters.categories.length > 0 && (
            <div className="space-y-2 sm:space-y-3 mb-4">
              <h3 className="font-medium text-sm sm:text-base">
                {t.products.categories}
              </h3>
              <div className="space-y-1.5 sm:space-y-2 max-h-52 overflow-y-auto pr-1">
                {availableFilters.categories.map((category) => (
                  <div
                    key={category._id}
                    className={`flex items-center ${
                      isRTL ? "space-x-reverse" : ""
                    } space-x-2`}
                  >
                    <Checkbox
                      id={`category-${category._id}`}
                      checked={selectedCategories.includes(category._id)}
                      onCheckedChange={() => toggleCategory(category._id)}
                    />
                    <label
                      htmlFor={`category-${category._id}`}
                      className="text-xs sm:text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {getCategoryName(category, locale)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Colors */}
        {availableColors.length > 0 && (
          <div className="space-y-2 sm:space-y-3 mb-4">
            <h3 className="font-medium text-sm sm:text-base">
              {t.products.colors}
            </h3>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {availableColors.map((color) => (
                <button
                  type="button"
                  key={color}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs sm:text-sm transition-colors ${
                    selectedColors.includes(color)
                      ? "border-black bg-black text-white"
                      : "border-gray-200 bg-white text-black hover:bg-gray-50"
                  }`}
                  onClick={() => toggleColor(color)}
                  title={color}
                  aria-label={
                    isRTL ? `تصفية اللون ${color}` : `Filter color ${color}`
                  }
                  aria-pressed={selectedColors.includes(color)}
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-black/10"
                    style={{ backgroundColor: getColorPreview(color) }}
                  />
                  <span>{color}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sizes */}
        {availableSizes.length > 0 && (
          <div className="space-y-2 sm:space-y-3 mb-4">
            <h3 className="font-medium text-sm sm:text-base">
              {t.products.sizes}
            </h3>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {availableSizes.map((size) => (
                <button
                  type="button"
                  key={size}
                  className={`px-2 sm:px-3 py-0.5 sm:py-1 border rounded cursor-pointer text-xs sm:text-sm ${
                    selectedSizes.includes(size)
                      ? "bg-black text-white"
                      : "bg-white text-black hover:bg-gray-100"
                  }`}
                  onClick={() => toggleSize(size)}
                  aria-pressed={selectedSizes.includes(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Other filters */}
        <div className="space-y-2 sm:space-y-3 mb-6">
          <div
            className={`flex items-center ${
              isRTL ? "space-x-reverse" : ""
            } space-x-2`}
          >
            <Checkbox
              id="discount"
              checked={onSale}
              onCheckedChange={(checked) => setOnSale(Boolean(checked))}
            />
            <label
              htmlFor="discount"
              className="text-xs sm:text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t.products.onSale}
            </label>
          </div>

          <div
            className={`flex items-center ${
              isRTL ? "space-x-reverse" : ""
            } space-x-2`}
          >
            <Checkbox
              id="new"
              checked={newArrivals}
              onCheckedChange={(checked) => setNewArrivals(Boolean(checked))}
            />
            <label
              htmlFor="new"
              className="text-xs sm:text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t.products.newArrivals}
            </label>
          </div>

          <div
            className={`flex items-center ${
              isRTL ? "space-x-reverse" : ""
            } space-x-2`}
          >
            <Checkbox
              id="inStock"
              checked={inStock}
              onCheckedChange={(checked) => setInStock(Boolean(checked))}
            />
            <label
              htmlFor="inStock"
              className="text-xs sm:text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t.products.inStock}
            </label>
          </div>
        </div>

        {/* Action buttons - sticky on mobile */}
        <div
          className={`flex flex-col gap-2 pt-2 ${
            mobileFiltersOpen ? "sticky bottom-0 bg-white pb-2" : ""
          }`}
        >
          <Button
            onClick={handleApplyFilters}
            className="w-full text-xs sm:text-sm py-1.5 sm:py-2"
          >
            {t.products.applyFilters}
          </Button>
          <Button
            onClick={handleResetFilters}
            variant="outline"
            className="w-full text-xs sm:text-sm py-1.5 sm:py-2"
          >
            {t.products.resetFilters}
          </Button>
        </div>
      </div>
    </div>
  );
}
