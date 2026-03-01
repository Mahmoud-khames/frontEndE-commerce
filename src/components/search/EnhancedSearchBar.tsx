// components/search/EnhancedSearchBar.tsx
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Search,
  X,
  Clock,
  TrendingUp,
  Loader2,
  ShoppingBag,
  Tag,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { debounce } from "lodash";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSearchSuggestions, useTrackSearch } from "@/hooks/useSearch";

interface EnhancedSearchBarProps {
  t: any;
  locale: string;
  className?: string;
  variant?: "default" | "minimal" | "expanded";
}

export default function EnhancedSearchBar({
  t,
  locale,
  className,
  variant = "default",
}: EnhancedSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRTL = locale === "ar";

  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Define proper types for suggestions
  interface SearchSuggestions {
    products: Array<{
      id: string;
      slug: string;
      name: string;
      nameEn?: string;
      nameAr?: string;
      image?: string;
      price: number;
      finalPrice: number;
    }>;
    categories: Array<{
      id: string;
      name: string;
      nameEn?: string;
      nameAr?: string;
      productCount: number;
    }>;
    popularSearches: string[];
  }

  // React Query hooks
  const { data, isLoading } = useSearchSuggestions(searchTerm, locale, {
    enabled: searchTerm.length >= 1 && isOpen,
  });

  const suggestions = data as SearchSuggestions | undefined;

  const trackSearchMutation = useTrackSearch();

  // Load search history
  useEffect(() => {
    const loadHistory = () => {
      const saved = localStorage.getItem("searchHistory");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSearchHistory(Array.isArray(parsed) ? parsed.slice(0, 10) : []);
        } catch {
          setSearchHistory([]);
        }
      }
    };
    loadHistory();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      const items = getTotalItems();

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % items);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + items) % items);
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0) {
            handleSelectItem(selectedIndex);
          } else if (searchTerm) {
            handleSearchSubmit();
          }
          break;
        case "Escape":
          setIsOpen(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, searchTerm]);

  // Get total navigable items count
  const getTotalItems = () => {
    let count = 0;
    if (searchTerm.length === 0 && searchHistory.length > 0) {
      count += searchHistory.length;
    }
    if (suggestions) {
      count +=
        (suggestions.products?.length || 0) +
        (suggestions.categories?.length || 0) +
        (suggestions.popularSearches?.length || 0);
    }
    return count;
  };

  // Handle item selection
  const handleSelectItem = (index: number) => {
    let currentIndex = 0;

    // History items
    if (searchTerm.length === 0 && searchHistory.length > 0) {
      if (index < searchHistory.length) {
        setSearchTerm(searchHistory[index]);
        handleSearchSubmit(searchHistory[index]);
        return;
      }
      currentIndex += searchHistory.length;
    }

    // Product items
    if (suggestions?.products) {
      if (index < currentIndex + suggestions.products.length) {
        const product = suggestions.products[index - currentIndex];
        router.push(`/${locale}/products/${product.slug}`);
        saveToHistory(searchTerm);
        trackSearch(searchTerm, 1, product.id);
        setIsOpen(false);
        return;
      }
      currentIndex += suggestions.products.length;
    }

    // Category items
    if (suggestions?.categories) {
      if (index < currentIndex + suggestions.categories.length) {
        const category = suggestions.categories[index - currentIndex];
        router.push(`/${locale}/products?categories=${category.id}`);
        setIsOpen(false);
        return;
      }
      currentIndex += suggestions.categories.length;
    }

    // Popular search items
    if (suggestions?.popularSearches) {
      if (index < currentIndex + suggestions.popularSearches.length) {
        const term = suggestions.popularSearches[index - currentIndex];
        setSearchTerm(term);
        handleSearchSubmit(term);
        return;
      }
    }
  };

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      // Analytics tracking can be added here
    }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(value.length > 0 || isFocused);
    setSelectedIndex(-1);
    debouncedSearch(value);
  };

  const handleSearchSubmit = (customQuery?: string) => {
    const query = customQuery || searchTerm;
    if (!query.trim()) return;

    saveToHistory(query);
    trackSearch(query, 0);
    router.push(`/${locale}/products?search=${encodeURIComponent(query)}`);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  const saveToHistory = (term: string) => {
    const newHistory = [
      term,
      ...searchHistory.filter((h) => h.toLowerCase() !== term.toLowerCase()),
    ].slice(0, 10);

    setSearchHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
  };

  const removeFromHistory = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = searchHistory.filter((h) => h !== term);
    setSearchHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
  };

  const trackSearch = (
    query: string,
    resultsCount: number,
    clickedProduct?: string
  ) => {
    trackSearchMutation.mutate({
      query,
      resultsCount,
      clickedProduct,
      sessionId: sessionStorage.getItem("sessionId") || "",
    });
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    // Escape special regex characters
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark
              key={i}
              className="bg-yellow-200 text-black font-medium px-0.5 rounded-sm"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div ref={searchRef} className={cn("relative w-full", className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearchSubmit();
        }}
      >
        <div className="relative">
          <Search
            className={cn(
              "absolute top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors",
              isRTL ? "right-3" : "left-3",
              isFocused && "text-primary"
            )}
          />

          <Input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => {
              setIsFocused(true);
              setIsOpen(true);
            }}
            onBlur={() => {
              setIsFocused(false);
              // Delay to allow click on suggestions
              setTimeout(() => {
                if (!searchRef.current?.contains(document.activeElement)) {
                  setIsOpen(false);
                }
              }, 200);
            }}
            placeholder={
              t.search?.placeholder || "Search for products, categories..."
            }
            className={cn(
              "w-full transition-all duration-300 text-sm sm:text-base bg-gray-50",
              isRTL ? "pr-10 pl-10" : "pl-10 pr-10",
              isFocused && "ring-2 ring-primary shadow-lg bg-white",
              variant === "minimal" && "h-10 border-gray-200 rounded-full",
              variant === "expanded" && "h-12 text-lg px-12"
            )}
          />

          {/* Loading indicator */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2",
                  isRTL ? "left-12" : "right-12"
                )}
              >
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Clear button */}
          <AnimatePresence>
            {searchTerm && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setIsOpen(false);
                  inputRef.current?.focus();
                }}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full transition-all",
                  isRTL ? "left-3" : "right-3"
                )}
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border overflow-hidden",
              "max-h-[70vh] overflow-y-auto custom-scrollbar"
            )}
            dir={isRTL ? "rtl" : "ltr"}
          >
            {/* Search History */}
            {searchTerm.length === 0 && searchHistory.length > 0 && (
              <div className="p-3 border-b bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {t.search?.recentSearches || "Recent Searches"}
                  </h3>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    {t.search?.clear || "Clear all"}
                  </button>
                </div>
                <div className="space-y-1">
                  {searchHistory.map((term, i) => (
                    <motion.button
                      key={term}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => {
                        setSearchTerm(term);
                        handleSearchSubmit(term);
                      }}
                      className={cn(
                        "flex items-center justify-between w-full p-2 hover:bg-white rounded-lg transition-colors text-sm group",
                        selectedIndex === i && "bg-white shadow-sm"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-gray-700">{term}</span>
                      </span>
                      <button
                        onClick={(e) => removeFromHistory(term, e)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                      >
                        <X className="h-3 w-3 text-gray-400" />
                      </button>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Product Suggestions */}
            {suggestions?.products && suggestions.products.length > 0 && (
              <div className="p-3 border-b">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  {t.search?.products || "Products"}
                </h3>
                <div className="space-y-1">
                  {suggestions.products.map((product, i) => {
                    const itemIndex = searchHistory.length + i;
                    return (
                      <Link
                        key={product.id}
                        href={`/${locale}/products/${product.slug}`}
                        className={cn(
                          "flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-all group",
                          selectedIndex === itemIndex && "bg-gray-50 shadow-sm"
                        )}
                        onClick={() => {
                          saveToHistory(searchTerm);
                          trackSearch(searchTerm, 1, product.id);
                          setIsOpen(false);
                        }}
                      >
                        {product.image && (
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {highlightMatch(
                              locale === "ar"
                                ? product.nameAr ||
                                    product.name ||
                                    product.nameEn ||
                                    ""
                                : product.nameEn ||
                                    product.name ||
                                    product.nameAr ||
                                    "",
                              searchTerm
                            )}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {product.finalPrice < product.price && (
                              <span className="text-xs text-gray-400 line-through">
                                {formatPrice(product.price)}
                              </span>
                            )}
                            <span className="text-sm font-semibold text-primary">
                              {formatPrice(product.finalPrice || product.price)}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Category Suggestions */}
            {suggestions?.categories && suggestions.categories.length > 0 && (
              <div className="p-3 border-b">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  {t.search?.categories || "Categories"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {suggestions.categories.map((category, i) => {
                    const itemIndex =
                      searchHistory.length +
                      (suggestions.products?.length || 0) +
                      i;
                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          router.push(
                            `/${locale}/products?categories=${category.id}`
                          );
                          setIsOpen(false);
                        }}
                        className={cn(
                          "px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-all",
                          "hover:shadow-md transform hover:-translate-y-0.5",
                          selectedIndex === itemIndex && "bg-gray-200 shadow-md"
                        )}
                      >
                        <span className="font-medium">
                          {highlightMatch(
                            locale === "ar"
                              ? category.nameAr ||
                                  category.name ||
                                  category.nameEn ||
                                  ""
                              : category.nameEn ||
                                  category.name ||
                                  category.nameAr ||
                                  "",
                            searchTerm
                          )}
                        </span>
                        {category.productCount > 0 && (
                          <span className="ml-1 text-xs text-gray-500">
                            ({category.productCount})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Popular/Trending Searches */}
            {suggestions?.popularSearches &&
              suggestions.popularSearches.length > 0 && (
                <div className="p-3 bg-gradient-to-b from-gray-50 to-white">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    {t.search?.trending || "Trending Searches"}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.popularSearches.map((term, i) => {
                      const itemIndex =
                        searchHistory.length +
                        (suggestions.products?.length || 0) +
                        (suggestions.categories?.length || 0) +
                        i;
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            setSearchTerm(term);
                            handleSearchSubmit(term);
                          }}
                          className={cn(
                            "px-3 py-1.5 bg-white border border-gray-200 hover:border-primary hover:bg-primary/5 rounded-full text-sm transition-all",
                            "hover:shadow-md transform hover:-translate-y-0.5",
                            selectedIndex === itemIndex &&
                              "border-primary bg-primary/5 shadow-md"
                          )}
                        >
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {term}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* No Results */}
            {searchTerm.length >= 2 &&
              !isLoading &&
              (!suggestions ||
                (suggestions.products?.length === 0 &&
                  suggestions.categories?.length === 0)) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-8 text-center"
                >
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium mb-1">
                    {t.search?.noResults || "No results found"}
                  </p>
                  <p className="text-sm text-gray-400 mb-4">
                    {t.search?.tryDifferent ||
                      "Try searching with different keywords"}
                  </p>
                  <button
                    onClick={() => handleSearchSubmit()}
                    className="text-primary hover:text-primary/80 font-medium text-sm hover:underline transition-colors"
                  >
                    {t.search?.searchAll || "Search all products"} →
                  </button>
                </motion.div>
              )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
