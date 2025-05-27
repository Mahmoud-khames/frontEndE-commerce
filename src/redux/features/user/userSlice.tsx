import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";
import { clearCart, fetchCartItems } from "../cart/cartSlice";
import { clearWishlist } from "../wishList/wishlistSlice";
import { getUsers, updateUser } from "@/server";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  token: string;
  phone?: string;
  userImage?: string;
}

interface UserState {
  user: User | null;
  users: any[];
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

const initialState: UserState = {
  user: null,
  users: [],
  isLoading: false,
  error: null,
  success: null,
};

// إضافة fetchUsers كـ createAsyncThunk
export const fetchUsers = createAsyncThunk(
  "user/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUsers();
      return response.data.users;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch users");
    }
  }
);

// إضافة updateUserProfile كـ createAsyncThunk
export const updateUserProfile = createAsyncThunk(
  "user/updateUserProfile",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await updateUser(formData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update profile");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.data;
      localStorage.setItem("token", action.payload.token);
      state.isLoading = false;
      state.error = null;
      state.success = "Login successful";
    },
    updateUserState: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        // Update user in localStorage if it exists there
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          localStorage.setItem("user", JSON.stringify({ ...parsedUser, ...action.payload }));
        }
      }
    },
    logout: (state) => {
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      state.isLoading = false;
      state.error = null;
      state.success = "Logout successful";
      // Note: We can't dispatch clearWishlist() directly here
      // We'll handle this in the component that calls logout
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setSuccess: (state, action) => {
      state.success = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Handle updateUserProfile actions
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user && action.payload.user) {
          // Update user state with the new data
          state.user = {
            ...state.user,
            firstName: action.payload.user.firstName,
            lastName: action.payload.user.lastName,
            email: action.payload.user.email,
            phone: action.payload.user.phone,
            userImage: action.payload.user.userImage,
          };
          
          // Update user in localStorage if it exists
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            localStorage.setItem("user", JSON.stringify({
              ...parsedUser,
              firstName: action.payload.user.firstName,
              lastName: action.payload.user.lastName,
              email: action.payload.user.email,
              phone: action.payload.user.phone,
              userImage: action.payload.user.userImage,
            }));
          }
        }
        state.success = action.payload.message || "Profile updated successfully";
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, updateUserState, logout, setIsLoading, setError, setSuccess } = userSlice.actions;
export default userSlice.reducer;
export const userSelector = (state: RootState) => state.user;
