import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { IProduct } from "@/types/type";

// Define filter interface
export interface ProductFilters {
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  colors?: string;
  sizes?: string;
  categories?: string;
  category?: string;
  discount?: string;
  new?: string;
  inStock?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

// Define pagination interface
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Define available filters interface
export interface AvailableFilters {
  colors: string[];
  sizes: string[];
  priceRange: { min: number; max: number };
  categories: Array<{ _id: string; name: string; count: number }>;
  counts: {
    total: number;
    newProducts: number;
    discountedProducts: number;
    inStock: number;
    outOfStock: number;
  };
}

// Define state interface
interface ProductsState {
  products: IProduct[];
  loading: boolean;
  error: string | null;
  noProduct: boolean;
  filters: ProductFilters;
  availableFilters: AvailableFilters;
  pagination: Pagination | null;
}

// Initial state
const initialState: ProductsState = {
  products: [],
  loading: false,
  error: null,
  noProduct: false,
  filters: {
    page: 1,
    limit: 12,
    sort: "newest"
  },
  availableFilters: {
    colors: [],
    sizes: [],
    priceRange: { min: 0, max: 1000 },
    categories: [],
    counts: {
      total: 0,
      newProducts: 0,
      discountedProducts: 0,
      inStock: 0,
      outOfStock: 0
    }
  },
  pagination: null
};

// Fetch products with filters
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (options: { applyFilters?: boolean } = {}, { getState, rejectWithValue }) => {
    try {
      const { filters } = (getState() as any).products;
      const apiURL = process.env.NEXT_PUBLIC_API_URL || '';
      
      // If applyFilters is false, fetch all products without filters
      if (options.applyFilters === false) {
        const response = await axios.get(`${apiURL}/api/product/filter?limit=100`);
        return response.data;
      }
      
      // Build query string from filters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value));
        }
      });
      
      console.log("Fetching products with params:", queryParams.toString());
      
      const response = await axios.get(`${apiURL}/api/product/filter?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching products:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch products");
    }
  }
);

// Fetch available filters
export const fetchAvailableFilters = createAsyncThunk(
  "products/fetchAvailableFilters",
  async (_, { rejectWithValue }) => {
    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await axios.get(`${apiURL}/api/product/available-filters`);
      return response.data.filters;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch filters");
    }
  }
);

// Add a dedicated search action
export const searchProducts = createAsyncThunk(
  "products/searchProducts",
  async (searchQuery: string, { dispatch, rejectWithValue }) => {
    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || '';
      
      // Make a direct search request to the correct endpoint
      const response = await axios.get(`${apiURL}/api/product/search?query=${encodeURIComponent(searchQuery)}`);
      
      console.log("Search response:", response.data);
      
      // Return the search results directly
      return response.data;
    } catch (error: any) {
      console.error("Error searching products:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to search products");
    }
  }
);
// Product slice
const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<ProductFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        page: 1,
        limit: 12,
        sort: "newest"
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.noProduct = false;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data;
        state.pagination = action.payload.pagination;
        state.noProduct = action.payload.noProduct || false;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch available filters
      .addCase(fetchAvailableFilters.pending, (state) => {
        // No need to set loading state for filters
      })
      .addCase(fetchAvailableFilters.fulfilled, (state, action) => {
        state.availableFilters = action.payload;
        
        // Update price range in filters if not already set by user
        if (state.filters.minPrice === undefined) {
          state.filters.minPrice = action.payload.priceRange.min;
        }
        if (state.filters.maxPrice === undefined) {
          state.filters.maxPrice = action.payload.priceRange.max;
        }
      })
      .addCase(fetchAvailableFilters.rejected, (state, action) => {
        console.error("Failed to fetch filters:", action.payload);
        // Keep using default filters
      })
      // Add cases for searchProducts
      .addCase(searchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.noProduct = false;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.loading = false;
        
        // Ensure we're setting the products array correctly
        if (action.payload && action.payload.data) {
          state.products = action.payload.data;
          state.pagination = action.payload.pagination || null;
          state.noProduct = action.payload.noProduct || false;
          
          // Log the products we're setting
          console.log("Setting products from search:", action.payload.data);
        } else {
          // If no data, set empty products
          state.products = [];
          state.pagination = null;
          state.noProduct = true;
          console.log("No products found in search response");
        }
        
        // Update filters with the search term
        if (action.meta.arg) {
          state.filters.search = action.meta.arg;
        }
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setFilters, resetFilters } = productSlice.actions;
export default productSlice.reducer;
