"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { setFilters, fetchAvailableFilters, fetchProducts, searchProducts } from "@/redux/features/prodect/prodectSlice";

export default function SearchParamsHandler() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    // Extract filter values from URL
    const categories = searchParams.get('categories');
    const colors = searchParams.get('colors');
    const sizes = searchParams.get('sizes');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const discount = searchParams.get('discount');
    const newArrival = searchParams.get('new');
    const inStock = searchParams.get('inStock');
    const sort = searchParams.get('sort');
    const page = searchParams.get('page');
    const search = searchParams.get('search');
    
    // Set filters in Redux state
    dispatch(setFilters({
      categories,
      colors,
      sizes,
      minPrice: minPrice ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
      discount,
      new: newArrival,
      inStock,
      sort,
      page: page ? parseInt(page) : 1,
      search,
    }));
    
    // If there's a search parameter, use the dedicated search action
    if (search) {
      console.log("Searching for:", search);
      dispatch(searchProducts(search));
    } else {
      // Otherwise fetch with regular filters
      dispatch(fetchProducts({ applyFilters: true }));
    }
    
    // Fetch available filters
    dispatch(fetchAvailableFilters());
  }, [dispatch, searchParams]);

  return null; // This component doesn't render anything
}

