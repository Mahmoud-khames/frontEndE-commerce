import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { getSubTotal, getCouponDiscount, activeCoupon } from "@/lib/cart";
import { formatCurrency } from "@/lib/formatters";
import { getCart, addToCart as apiAddToCart, updateCart, removeFromCart as apiRemoveFromCart, clearCart as apiClearCart } from "@/server";
import { RootState } from "@/redux/store";
import { IProduct } from "@/types/type";

export interface CartItem {
  product: IProduct;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartState {
  items: CartItem[];
  discount: number;
  appliedCoupon: string | null;
  loading: boolean;
  error: string | null;
}

const initialCartState: CartState = {
  items: [],
  discount: 0,
  appliedCoupon: null,
  loading: false,
  error: null
};

// Async thunks
export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems", 
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { items: [] }; // Return empty cart if not logged in
      }
      
      const response = await getCart();
      return response.data.data;
    } catch (error) {
      return rejectWithValue("Failed to fetch cart items");
    }
  }
);

export const addToCartAsync = createAsyncThunk(
  "cart/addToCartAsync",
  async (payload: { productId: string, quantity: number, size?: string, color?: string, price?: number }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // If not logged in, return a simulated response
        return { 
          items: [{ 
            product: { _id: payload.productId },
            quantity: payload.quantity,
            size: payload.size,
            color: payload.color
          }]
        };
      }
      
      const response = await apiAddToCart(payload);
      return response.data.data;
    } catch (error) {
      return rejectWithValue("Failed to add item to cart");
    }
  }
);

export const updateCartItemAsync = createAsyncThunk(
  "cart/updateCartItemAsync",
  async (payload: { id: string, quantity: number }, { rejectWithValue }) => {
    try {
      const response = await updateCart(payload.id, { quantity: payload.quantity });
      return response.data.data;
    } catch (error) {
      return rejectWithValue("Failed to update cart item");
    }
  }
);

export const removeFromCartAsync = createAsyncThunk(
  "cart/removeFromCartAsync",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiRemoveFromCart(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue("Failed to remove item from cart");
    }
  }
);

export const clearCartAsync = createAsyncThunk(
  "cart/clearCartAsync",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { items: [] }; // Return empty cart if not logged in
      }
      
      const response = await apiClearCart();
      return response.data.data;
    } catch (error) {
      return rejectWithValue("Failed to clear cart");
    }
  }
);

export const validateCouponAsync = createAsyncThunk(
  "cart/validateCouponAsync",
  async (payload: { coupon: string, total: number }, { rejectWithValue }) => {
    try {
      // First validate the coupon
      const validationResult = await activeCoupon(payload.coupon);
      
      if (!validationResult.valid) {
        return rejectWithValue(validationResult.message || "Invalid coupon");
      }
      
      // Then calculate the discount
      const discountResult = await getCouponDiscount(payload.coupon, payload.total);
      
      if (discountResult.error) {
        return rejectWithValue(discountResult.error);
      }
      
      return {
        coupon: payload.coupon,
        discount: discountResult.discount
      };
    } catch (error) {
      return rejectWithValue("Failed to validate coupon");
    }
  }
);

export const cartSlice = createSlice({
  name: "cart",
  initialState: initialCartState,
  reducers: {
    // Keep local actions for offline support
    addItemToCart: (state, action) => {
      const { product, quantity = 1, size, color } = action.payload;
      const existingItem = state.items.find(
        (item) => item.product._id === product._id
      );
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ product, quantity, size, color });
      }
      
    },
    removeItemFromCart: (state, action) => {
      state.items = state.items.filter(
        (item) => item.product._id !== action.payload.id
      );
     
    },
    updateItemQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((item) => item.product._id === productId);
      if (item && quantity > 0) {
        item.quantity = quantity;
      } else if (item && quantity <= 0) {
        state.items = state.items.filter(
          (item) => item.product._id !== productId
        );
      }
      
    },
    applyCoupon: (state, action) => {
      const { coupon, total } = action.payload;
      
      // This is a synchronous action that should be used carefully
      // Prefer using the async thunk version when possible
      
      // For now, just set the coupon code and let the async validation happen later
      state.appliedCoupon = coupon;
      
      // Don't show success message here as we haven't validated the coupon yet
      // The actual discount will be applied by the async thunk
    },
    removeCoupon: (state) => {
      state.discount = 0;
      state.appliedCoupon = null;
    },
    clearCart: (state) => {
      state.items = [];
      state.discount = 0;
      state.appliedCoupon = null;
      localStorage.removeItem("cartItems"); // Clear cart from localStorage if you're storing it there
    },
    setDiscount: (state, action) => {
      state.discount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCartItems
      .addCase(fetchCartItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.items) {
          state.items = action.payload.items.map((item: any) => ({
            product: item.product,
            quantity: item.quantity,
            size: item.size,
            color: item.color
          }));
        } else {
          state.items = [];
        }
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add other async thunk cases
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        if (action.payload && action.payload.items) {
          state.items = action.payload.items.map((item: any) => ({
            product: item.product,
            quantity: item.quantity,
            size: item.size,
            color: item.color
          }));
          toast.success("Item added to cart!");
        }
      })
      .addCase(updateCartItemAsync.fulfilled, (state, action) => {
        // Check if action.payload and action.payload.product exist before accessing productName
        if (action.payload && action.payload.product) {
          toast.success(`${action.payload.product.productName} updated in cart!`);
          // Update local state with server response to keep in sync
          state.items = action.payload.items.map((item: any) => ({
            product: item.product,
            quantity: item.quantity,
            size: item.size,
            color: item.color
          }));
        } else {
          toast.success("Cart updated!");
        }
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        // Check if action.payload and action.payload.product exist before accessing productName
        if (action.payload && action.payload.product) {
          toast.success(`${action.payload.product.productName} removed from cart!`);
          // Update local state with server response to keep in sync
          state.items = action.payload.items.map((item: any) => ({
            product: item.product,
            quantity: item.quantity,
            size: item.size,
            color: item.color
          }));
        } else {
          toast.success("Item removed from cart!");
         
        }
      })
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.items = [];
        state.discount = 0;
        state.appliedCoupon = null;
        toast.success("Cart cleared!");
      })
      .addCase(validateCouponAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(validateCouponAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.appliedCoupon = action.payload.coupon;
        state.discount = action.payload.discount;
        
        // Format the discount for the toast message
        const formattedDiscount = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2
        }).format(action.payload.discount);
        
        toast.success(`Coupon applied! You saved ${formattedDiscount}`);
      })
      .addCase(validateCouponAsync.rejected, (state, action) => {
        state.loading = false;
        state.appliedCoupon = null;
        state.discount = 0;
        toast.error(action.payload as string || "Failed to apply coupon");
      });
  },
});

export const {
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  clearCart,
  applyCoupon,
  removeCoupon,
  setDiscount,
} = cartSlice.actions;

export default cartSlice.reducer;

export const selectCartItems = (state: RootState) => state.cart.items;
export const selectDiscount = (state: RootState) => state.cart.discount;
export const selectAppliedCoupon = (state: RootState) => state.cart.appliedCoupon;
export const selectCartLoading = (state: RootState) => state.cart.loading;

// Make sure we have a selector for the final total
export const selectFinalTotal = (state: RootState) => {
  const subtotal = getSubTotal(state.cart.items);
  return subtotal - state.cart.discount + deliveryFee;
};
