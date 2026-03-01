// src/api/services/categoryService.ts
import axiosInstance from "../lib/axios";
import type { CategoryResponse, CategoriesResponse } from "../types";

export const categoryService = {
  getCategories: async (): Promise<CategoriesResponse> => {
    const { data } = await axiosInstance.get("/api/category");
    return data;
  },

  getActiveCategories: async (): Promise<CategoriesResponse> => {
    const { data } = await axiosInstance.get("/api/category/active");
    return data;
  },

  getMainCategoriesWithSubs: async (): Promise<CategoriesResponse> => {
    const { data } = await axiosInstance.get("/api/category/main-with-subs");
    return data;
  },

  getCategory: async (id: string): Promise<CategoryResponse> => {
    const { data } = await axiosInstance.get(`/api/category/${id}`);
    return data;
  },

  getCategoryBySlug: async (slug: string): Promise<CategoryResponse> => {
    const { data } = await axiosInstance.get(`/api/category/slug/${slug}`);
    return data;
  },

  createCategory: async (formData: FormData): Promise<CategoryResponse> => {
    const { data } = await axiosInstance.post("/api/category", formData);
    return data;
  },

  updateCategory: async (
    id: string,
    formData: FormData
  ): Promise<CategoryResponse> => {
    const { data } = await axiosInstance.put(`/api/category/${id}`, formData);
    return data;
  },

  deleteCategory: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const { data } = await axiosInstance.delete(`/api/category/${id}`);
    return data;
  },
};
