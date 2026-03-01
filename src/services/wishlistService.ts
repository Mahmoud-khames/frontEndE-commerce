// src/api/services/wishlistService.ts
import axiosInstance from "../lib/axios";
import type { WishlistResponse } from "../types";

export const wishlistService = {
  getWishlist: async (): Promise<WishlistResponse> => {
    const { data } = await axiosInstance.get("/api/wishlist");
    return data;
  },

  addToWishlist: async (productId: string): Promise<WishlistResponse> => {
    const { data } = await axiosInstance.post("/api/wishlist", { productId });
    return data;
  },

  removeFromWishlist: async (productId: string): Promise<WishlistResponse> => {
    const { data } = await axiosInstance.delete(`/api/wishlist/${productId}`);
    return data;
  },

  clearWishlist: async (): Promise<WishlistResponse> => {
    const { data } = await axiosInstance.delete("/api/wishlist/clear");
    return data;
  },

  toggleWishlist: async (productId: string): Promise<WishlistResponse> => {
    const { data } = await axiosInstance.post("/api/wishlist/toggle", {
      productId,
    });
    return data;
  },

  checkProduct: async (
    productId: string
  ): Promise<{ data: { isInWishlist: boolean } }> => {
    const { data } = await axiosInstance.get(`/api/wishlist/${productId}`);
    return data;
  },
};
