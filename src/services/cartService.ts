// src/api/services/cartService.ts
import axiosInstance from "../lib/axios";
import type {
  CartResponse,
  AddToCartPayload,
  UpdateCartItemPayload,
  GuestCartItem,
  CartValidation,
  CartSummary,
} from "@/types";

class CartServiceClass {
  async getCart(): Promise<CartResponse> {
    const { data } = await axiosInstance.get("/api/cart");
    return data;
  }

  async getCartSummary(): Promise<{ summary: CartSummary }> {
    const { data } = await axiosInstance.get("/api/cart/summary");
    return data;
  }

  async addToCart(payload: AddToCartPayload): Promise<CartResponse> {
    const { data } = await axiosInstance.post("/api/cart", payload);
    return data;
  }

  async updateCartItem(
    productId: string,
    payload: UpdateCartItemPayload
  ): Promise<CartResponse> {
    const { data } = await axiosInstance.put(`/api/cart/${productId}`, payload);
    return data;
  }

  async removeFromCart(productId: string): Promise<CartResponse> {
    const { data } = await axiosInstance.delete(`/api/cart/${productId}`);
    return data;
  }

  async clearCart(): Promise<CartResponse> {
    const { data } = await axiosInstance.delete("/api/cart/clear");
    return data;
  }

  async applyCoupon(code: string): Promise<CartResponse> {
    const { data } = await axiosInstance.post("/api/cart/coupon/apply", {
      code,
    });
    return data;
  }

  async removeCoupon(): Promise<CartResponse> {
    const { data } = await axiosInstance.delete("/api/cart/coupon/remove");
    return data;
  }

  async validateCart(): Promise<CartValidation> {
    const { data } = await axiosInstance.post("/api/cart/validate");
    return data;
  }

  async mergeGuestCart(guestCartItems: GuestCartItem[]): Promise<CartResponse> {
    const { data } = await axiosInstance.post("/api/cart/merge-guest", {
      guestCartItems,
    });
    return data;
  }
}

export const cartService = new CartServiceClass();