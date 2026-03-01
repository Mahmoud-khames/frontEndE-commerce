// src/api/services/productService.ts
import axiosInstance from "../lib/axios";
import type {
  ProductResponse,
  ProductsResponse,
  ProductFilters,
  AvailableFilters,
} from "../types";

export const productService = {
  getProducts: async (params?: ProductFilters): Promise<ProductsResponse> => {
    const { data } = await axiosInstance.get("/api/product", { params });
    return data;
  },

  getProduct: async (id: string): Promise<ProductResponse> => {
    const { data } = await axiosInstance.get(`/api/product/id/${id}`);
    return data;
  },

  getProductBySlug: async (slug: string): Promise<ProductResponse> => {
    const { data } = await axiosInstance.get(`/api/product/slug/${slug}`);
    return data;
  },

  searchProducts: async (
    query: string,
    params?: ProductFilters
  ): Promise<ProductsResponse> => {
    const { data } = await axiosInstance.get("/api/product/search", {
      params: { query, ...params },
    });
    return data;
  },

  filterProducts: async (
    filters: ProductFilters
  ): Promise<ProductsResponse> => {
    const { data } = await axiosInstance.get("/api/product/filter", {
      params: filters,
    });
    return data;
  },

  getNewProducts: async (): Promise<ProductsResponse> => {
    const { data } = await axiosInstance.get("/api/product/new");
    return data;
  },

  getDiscountedProducts: async (): Promise<ProductsResponse> => {
    const { data } = await axiosInstance.get("/api/product/discounted");
    return data;
  },

  getBestSellingProducts: async (limit = 8): Promise<ProductsResponse> => {
    const { data } = await axiosInstance.get("/api/product/bestselling", {
      params: { limit },
    });
    return data;
  },

  getAvailableFilters: async (): Promise<{
    success: boolean;
    filters: AvailableFilters;
  }> => {
    const { data } = await axiosInstance.get("/api/product/available-filters");
    return data;
  },

  createProduct: async (formData: FormData): Promise<ProductResponse> => {
    const { data } = await axiosInstance.post("/api/product", formData);
    return data;
  },

  updateProduct: async (
    slug: string,
    formData: FormData
  ): Promise<ProductResponse> => {
    const { data } = await axiosInstance.put(`/api/product/${slug}`, formData);
    return data;
  },

  deleteProduct: async (
    slug: string
  ): Promise<{ success: boolean; message: string }> => {
    const { data } = await axiosInstance.delete(`/api/product/${slug}`);
    return data;
  },
};
