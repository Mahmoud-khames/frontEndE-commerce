// src/redux/features/category/categorySlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getCategories } from "@/server";

interface Category {
  _id: string;
  name: string;
  slug: string;
  image:string
}

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async () => {
    const response = await getCategories();
    console.log(response.data.data);
    return response.data.data;
  }
);

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
        state.loading = false;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.error = action.error.message || "Failed to fetch categories";
        state.loading = false;
      });
  },
});

export default categorySlice.reducer;
