"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setFilters, fetchAvailableFilters } from "@/redux/features/prodect/prodectSlice";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function ProductFilter({ t, locale }: { t: any; locale: string }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { availableFilters, filters } = useAppSelector((state) => state.products);
  
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

  // Initialize filter states from URL params
  useEffect(() => {
    if (availableFilters) {
      // Set price range
      if (availableFilters.priceRange) {
        const min = filters?.minPrice ?? availableFilters.priceRange.min;
        const max = filters?.maxPrice ?? availableFilters.priceRange.max;
        setPriceRange([min, max]);
      }

      // Set categories
      if (filters?.categories) {
        const cats = typeof filters.categories === 'string' 
          ? filters.categories.split(',') 
          : filters.categories;
        setSelectedCategories(cats);
      }

      // Set colors
      if (filters?.colors) {
        const cols = typeof filters.colors === 'string'
          ? filters.colors.split(',')
          : filters.colors;
        setSelectedColors(cols);
      }

      // Set sizes
      if (filters?.sizes) {
        const szs = typeof filters.sizes === 'string'
          ? filters.sizes.split(',')
          : filters.sizes;
        setSelectedSizes(szs);
      }

      // Set other filters
      setOnSale(!!filters?.discount);
      setNewArrivals(!!filters?.new);
      setInStock(!!filters?.inStock);
    }
  }, [availableFilters, filters]);

  // Fetch available filters on component mount
  useEffect(() => {
    dispatch(fetchAvailableFilters());
  }, [dispatch]);

  // Handle price input changes
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setPriceRange([value, priceRange[1]]);
    }
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setPriceRange([priceRange[0], value]);
    }
  };

  // Toggle category selection
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Toggle color selection
  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  // Toggle size selection
  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  // Apply filters
  const handleApplyFilters = () => {
    // Create new URLSearchParams
    const params = new URLSearchParams(searchParams.toString());
    
    // Set price range
    if (priceRange[0] !== availableFilters?.priceRange?.min) {
      params.set('minPrice', priceRange[0].toString());
    } else {
      params.delete('minPrice');
    }
    
    if (priceRange[1] !== availableFilters?.priceRange?.max) {
      params.set('maxPrice', priceRange[1].toString());
    } else {
      params.delete('maxPrice');
    }
    
    // Set categories
    if (selectedCategories.length > 0) {
      params.set('categories', selectedCategories.join(','));
    } else {
      params.delete('categories');
    }
    
    // Set colors
    if (selectedColors.length > 0) {
      params.set('colors', selectedColors.join(','));
    } else {
      params.delete('colors');
    }
    
    // Set sizes
    if (selectedSizes.length > 0) {
      params.set('sizes', selectedSizes.join(','));
    } else {
      params.delete('sizes');
    }
    
    // Set other filters
    if (onSale) {
      params.set('discount', 'true');
    } else {
      params.delete('discount');
    }
    
    if (newArrivals) {
      params.set('new', 'true');
    } else {
      params.delete('new');
    }
    
    if (inStock) {
      params.set('inStock', 'true');
    } else {
      params.delete('inStock');
    }
    
    // Reset page to 1
    params.set('page', '1');
    
    // Update URL
    router.push(`${pathname}?${params.toString()}`);
    
    // Update Redux state
    dispatch(setFilters({
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      colors: selectedColors.length > 0 ? selectedColors : undefined,
      sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
      discount: onSale ? 'true' : undefined,
      new: newArrivals ? 'true' : undefined,
      inStock: inStock ? 'true' : undefined,
      page: 1,
    }));
    
    // Close mobile filters
    setMobileFiltersOpen(false);
  };

  // Reset filters
  const handleResetFilters = () => {
    // Reset all state
    if (availableFilters?.priceRange) {
      setPriceRange([
        availableFilters.priceRange.min,
        availableFilters.priceRange.max
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
    const search = searchParams.get('search');
    if (search) {
      params.set('search', search);
    }
    
    // Update URL
    router.push(`${pathname}?${params.toString()}`);
    
    // Update Redux state
    dispatch(setFilters({
      minPrice: availableFilters?.priceRange?.min,
      maxPrice: availableFilters?.priceRange?.max,
      categories: undefined,
      colors: undefined,
      sizes: undefined,
      discount: undefined,
      new: undefined,
      inStock: undefined,
      page: 1,
      search,
    }));
  };

  return (
    <div className="p-3 sm:p-4 border rounded-lg bg-white space-y-4 sm:space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-base sm:text-lg">{t.products.filter}</h2>
        
        {/* Mobile filter toggle button - only visible on small screens */}
        <button 
          className="lg:hidden text-sm bg-gray-100 px-2 py-1 rounded"
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
        >
          {mobileFiltersOpen ? t.products.hideFilters : t.products.showFilters}
        </button>
      </div>
      
      {/* Filter content - collapsible on mobile */}
      <div className={`space-y-4 sm:space-y-5 ${mobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
        {/* Price Range */}
        {availableFilters?.priceRange && (
          <div className="space-y-2 sm:space-y-3">
            <h3 className="font-medium text-sm sm:text-base">{t.products.priceRange}</h3>
            <div className="px-2">
              <Slider
                value={priceRange}
                min={availableFilters.priceRange.min}
                max={availableFilters.priceRange.max}
                step={1}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                className="my-4 sm:my-6"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-500">{t.products.from}</label>
                <Input
                  type="number"
                  value={priceRange[0]}
                  onChange={handleMinPriceChange}
                  min={availableFilters.priceRange.min}
                  max={priceRange[1]}
                  className="mt-1 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500">{t.products.to}</label>
                <Input
                  type="number"
                  value={priceRange[1]}
                  onChange={handleMaxPriceChange}
                  min={priceRange[0]}
                  max={availableFilters.priceRange.max}
                  className="mt-1 text-sm"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Categories */}
        {availableFilters?.categories && availableFilters.categories.length > 0 && (
          <div className="space-y-2 sm:space-y-3">
            <h3 className="font-medium text-sm sm:text-base">{t.products.categories}</h3>
            <div className="space-y-1 sm:space-y-2 max-h-32 sm:max-h-40 overflow-y-auto pr-1">
              {availableFilters.categories.map((category) => (
                <div key={category._id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category._id}`}
                    checked={selectedCategories.includes(category._id)}
                    onCheckedChange={() => toggleCategory(category._id)}
                  />
                  <label
                    htmlFor={`category-${category._id}`}
                    className="text-xs sm:text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Colors */}
        {availableFilters?.colors && availableFilters.colors.length > 0 && (
          <div className="space-y-2 sm:space-y-3">
            <h3 className="font-medium text-sm sm:text-base">{t.products.colors}</h3>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {availableFilters.colors.map((color) => (
                <div
                  key={color}
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full cursor-pointer border ${
                    selectedColors.includes(color) ? 'ring-2 ring-offset-1 sm:ring-offset-2 ring-black' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => toggleColor(color)}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Sizes */}
        {availableFilters?.sizes && availableFilters.sizes.length > 0 && (
          <div className="space-y-2 sm:space-y-3">
            <h3 className="font-medium text-sm sm:text-base">{t.products.sizes}</h3>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {availableFilters.sizes.map((size) => (
                <div
                  key={size}
                  className={`px-2 sm:px-3 py-0.5 sm:py-1 border rounded cursor-pointer text-xs sm:text-sm ${
                    selectedSizes.includes(size) 
                      ? 'bg-black text-white' 
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                  onClick={() => toggleSize(size)}
                >
                  {size}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Other filters */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="discount"
              checked={onSale}
              onCheckedChange={() => setOnSale(!onSale)}
            />
            <label
              htmlFor="discount"
              className="text-xs sm:text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t.products.onSale}
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="new"
              checked={newArrivals}
              onCheckedChange={() => setNewArrivals(!newArrivals)}
            />
            <label
              htmlFor="new"
              className="text-xs sm:text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t.products.newArrivals}
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="inStock"
              checked={inStock}
              onCheckedChange={() => setInStock(!inStock)}
            />
            <label
              htmlFor="inStock"
              className="text-xs sm:text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t.products.inStock}
            </label>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={handleApplyFilters} className="w-full text-xs sm:text-sm py-1.5 sm:py-2">
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

