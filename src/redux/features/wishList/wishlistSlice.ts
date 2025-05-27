import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { IProduct } from "@/types/type";
import { RootState } from "@/redux/store";
import { toast } from "react-toastify";
import { getWishlistProducts, addToWishlist as apiAddToWishlist, removeFromWishlist as apiRemoveFromWishlist, clearWishlist as apiClearWishlist } from "@/server";

interface WishlistState {
  wishlist: IProduct[];
  loading: boolean;
  error: string | null;
}

// Initialize wishlist from localStorage only if not logged in
const initialWishlistItems = (() => {
  if (typeof window === 'undefined') {
    return []; // Return empty array during server-side rendering
  }
  
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      const items = localStorage.getItem("wishlistItems");
      return items ? JSON.parse(items) : [];
    }
    return [];
  } catch (error) {
    console.error("Error parsing wishlistItems:", error);
    return [];
  }
})();

const initialState: WishlistState = {
  wishlist: initialWishlistItems,
  loading: false,
  error: null
};

// Create async thunks
export const fetchWishlistItems = createAsyncThunk(
  "wishlist/fetchWishlistItems",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { products: [] }; // Return empty wishlist if not logged in
      }
      
      const response = await getWishlistProducts();
      return response.data.data;
    } catch (error) {
      return rejectWithValue("Failed to fetch wishlist items");
    }
  }
);

export const addToWishlistAsync = createAsyncThunk(
  "wishlist/addToWishlistAsync",
  async (product: IProduct, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { product }; // Return product if not logged in
      }
      
      const response = await apiAddToWishlist(product._id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue("Failed to add item to wishlist");
    }
  }
);

export const removeFromWishlistAsync = createAsyncThunk(
  "wishlist/removeFromWishlistAsync",
  async (productId: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { productId }; // Return productId if not logged in
      }
      
      const response = await apiRemoveFromWishlist(productId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue("Failed to remove item from wishlist");
    }
  }
);

export const clearWishlistAsync = createAsyncThunk(
  "wishlist/clearWishlistAsync",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { products: [] }; // Return empty wishlist if not logged in
      }
      
      const response = await apiClearWishlist();
      return response.data.data;
    } catch (error) {
      return rejectWithValue("Failed to clear wishlist");
    }
  }
);

export const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      // Check if the item already exists in the wishlist
      const existingItem = state.wishlist.find(item => item._id === action.payload._id);
      
      if (!existingItem) {
        state.wishlist.push(action.payload);
        
        // Only save to localStorage if not logged in
        if (!localStorage.getItem("token")) {
          try {
            localStorage.setItem("wishlistItems", JSON.stringify(state.wishlist || []));
          } catch (error) {
            console.error("Error saving wishlistItems to localStorage:", error);
          }
        }
      }
    },
    removeFromWishlist: (state, action) => {
      state.wishlist = state.wishlist.filter(item => item._id !== action.payload);
      
      // Only save to localStorage if not logged in
      if (!localStorage.getItem("token")) {
        try {
          localStorage.setItem("wishlistItems", JSON.stringify(state.wishlist || []));
        } catch (error) {
          console.error("Error saving wishlistItems to localStorage:", error);
        }
      }
    },
    clearWishlist: (state) => {
      state.wishlist = [];
      localStorage.removeItem("wishlistItems");
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchWishlistItems
      .addCase(fetchWishlistItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWishlistItems.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.wishlist) {
          state.wishlist = action.payload.wishlist;
        } else {
          state.wishlist = [];
        }
      })
      .addCase(fetchWishlistItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // addToWishlistAsync
      .addCase(addToWishlistAsync.fulfilled, (state, action) => {
        if (action.payload && action.payload.wishlist) {
          state.wishlist = action.payload.wishlist;
        } else if (action.payload && action.payload.product) {
          // For non-logged in users
          const existingItem = state.wishlist.find(item => item._id === action.payload.product._id);
          if (!existingItem) {
            state.wishlist.push(action.payload.product);
          }
        }
        toast.success("Item added to wishlist!");
      })
      // removeFromWishlistAsync
      .addCase(removeFromWishlistAsync.fulfilled, (state, action) => {
        if (action.payload && action.payload.wishlist) {
          state.wishlist = action.payload.wishlist;
        } else if (action.payload && action.payload.productId) {
          // For non-logged in users
          state.wishlist = state.wishlist.filter(item => item._id !== action.payload.productId);
        }
        toast.success("Item removed from wishlist!");
      })
      // clearWishlistAsync
      .addCase(clearWishlistAsync.fulfilled, (state) => {
        state.wishlist = [];
        toast.success("Wishlist cleared!");
      });
  }
});

export const { addToWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;

export const selectWishlistItems = (state: RootState) => state.wishlist.wishlist;
export const selectWishlistLoading = (state: RootState) => state.wishlist.loading;

