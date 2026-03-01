import axiosInstance from "@/lib/axios";

export interface SearchSuggestion {
  products: Array<{
    id: string;
    name: string;
    slug: string;
    image: string;
    price: number;
    finalPrice: number;
  }>;
  categories: Array<{
    id: string;
    name: string;
    productCount: number;
  }>;
  popularSearches: string[];
  searchHistory: string[];
}

export interface SmartSearchResult {
  products: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
  searchInfo: {
    query: string;
    method: string;
    resultsCount: number;
    totalResults: number;
  };
  filters: {
    appliedFilters: any;
    availableFilters: any;
  };
}

class SearchService {
  // البحث الذكي
  async smartSearch(query: string, options: any = {}) {
    const params = new URLSearchParams({
      q: query,
      page: options.page || '1',
      limit: options.limit || '12',
      lang: options.lang || 'en',
      sort: options.sort || 'relevance',
      ...(options.categories && { categories: options.categories }),
      ...(options.minPrice && { minPrice: options.minPrice }),
      ...(options.maxPrice && { maxPrice: options.maxPrice }),
      ...(options.colors && { colors: options.colors }),
      ...(options.sizes && { sizes: options.sizes }),
    });
    
    const response = await axiosInstance.get(`/api/search?${params}`);
    return response.data;
  }
  
  // اقتراحات البحث
  async getSuggestions(query: string, locale: string = 'en'): Promise<SearchSuggestion> {
    const params = new URLSearchParams({
      q: query,
      lang: locale,
      limit: '10'
    });
    
    const response = await axiosInstance.get(`/api/search/suggestions?${params}`);
    return response.data;
  }
  
  // البحوث الشائعة
  async getTrendingSearches(locale: string = 'en', limit: number = 10) {
    const response = await axiosInstance.get('/api/search/trending', {
      params: { lang: locale, limit }
    });
    return response.data.trending;
  }
  
  // تتبع البحث
  async trackSearch(data: any) {
    return axiosInstance.post('/api/search/track', data);
  }
  
  // مسح سجل البحث
  async clearUserHistory() {
    return axiosInstance.delete('/api/search/history');
  }
  
  // تحليلات البحث
  async getAnalytics(period: string = '7d') {
    const response = await axiosInstance.get('/api/search/analytics', {
      params: { period }
    });
    return response.data.analytics;
  }
}

export const searchService = new SearchService();