// hooks/useSearch.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { searchService } from "@/services/searchService";
import { debounce } from "lodash";
import toast from "react-hot-toast";

interface SearchOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

// Hook لاقتراحات البحث
export const useSearchSuggestions = (
  query: string,
  locale: string = "en",
  options: SearchOptions = {}
) => {
  return useQuery({
    queryKey: ["search", "suggestions", query, locale],
    queryFn: () => searchService.getSuggestions(query, locale),
    enabled: query.length >= 1 && options.enabled !== false,
    staleTime: options.staleTime || 30000, // 30 seconds
    gcTime: options.cacheTime || 5 * 60 * 1000, // 5 minutes
  });
};

// Hook للبحث الذكي
export const useSmartSearch = (
  query: string,
  filters: any = {},
  locale: string = "en"
) => {
  return useQuery({
    queryKey: ["search", "smart", query, filters, locale],
    queryFn: () =>
      searchService.smartSearch(query, { ...filters, lang: locale }),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook للبحوث الشائعة
export const useTrendingSearches = (
  locale: string = "en",
  limit: number = 10
) => {
  return useQuery({
    queryKey: ["search", "trending", locale, limit],
    queryFn: () => searchService.getTrendingSearches(locale, limit),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

// Hook لتتبع البحث
export const useTrackSearch = () => {
  return useMutation({
    mutationFn: (data: {
      query: string;
      resultsCount: number;
      clickedProduct?: string;
      sessionId?: string;
    }) => searchService.trackSearch(data),
    onError: (error) => {
      console.error("Failed to track search:", error);
    },
  });
};

// Hook لمسح سجل البحث
export const useClearSearchHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => searchService.clearUserHistory(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["search", "history"] });
      toast.success("Search history cleared");
    },
    onError: () => {
      toast.error("Failed to clear search history");
    },
  });
};

// Hook لتحليلات البحث (للإدارة)
export const useSearchAnalytics = (period: string = "7d") => {
  return useQuery({
    queryKey: ["search", "analytics", period],
    queryFn: () => searchService.getAnalytics(period),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
