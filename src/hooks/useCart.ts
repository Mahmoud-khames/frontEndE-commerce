// src/hooks/useCart.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartService } from "@/services/cartService";
import type {
  AddToCartPayload,
  UpdateCartItemPayload,
  GuestCartItem,
  CartResponse,
} from "@/types";
import toast from "react-hot-toast";
import { useCallback } from "react";

// Query Keys
export const cartKeys = {
  all: ["cart"] as const,
  summary: ["cart", "summary"] as const,
  validation: ["cart", "validation"] as const,
};

// Get Cart Hook
export const useCart = () => {
  return useQuery({
    queryKey: cartKeys.all,
    queryFn: () => cartService.getCart(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
  });
};

// Get Cart Summary Hook
export const useCartSummary = () => {
  return useQuery({
    queryKey: cartKeys.summary,
    queryFn: () => cartService.getCartSummary(),
    staleTime: 1000 * 60 * 2,
  });
};

// Add to Cart Hook
export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddToCartPayload) => cartService.addToCart(data),
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: cartKeys.all });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.all, data);
      toast.success(data.message || "Product added to cart");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add product");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
};

// Update Cart Item Hook
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string;
      data: UpdateCartItemPayload;
    }) => cartService.updateCartItem(productId, data),
    onMutate: async ({ productId, data }) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.all });

      const previousCart = queryClient.getQueryData<CartResponse>(cartKeys.all);

      // Optimistic update
      if (previousCart && data.quantity) {
        const updatedItems = previousCart.data.items.map((item) =>
          item.product._id === productId
            ? { ...item, quantity: data.quantity! }
            : item
        );

        queryClient.setQueryData(cartKeys.all, {
          ...previousCart,
          data: {
            ...previousCart.data,
            items: updatedItems,
          },
        });
      }

      return { previousCart };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.all, data);
      toast.success(data.message || "Cart updated");
    },
    onError: (error: any, _, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.all, context.previousCart);
      }
      toast.error(error.response?.data?.message || "Failed to update cart");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
};

// Remove from Cart Hook
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => cartService.removeFromCart(productId),
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.all });

      const previousCart = queryClient.getQueryData<CartResponse>(cartKeys.all);

      // Optimistic update
      if (previousCart) {
        const updatedItems = previousCart.data.items.filter(
          (item) => item.product._id !== productId
        );

        queryClient.setQueryData(cartKeys.all, {
          ...previousCart,
          data: {
            ...previousCart.data,
            items: updatedItems,
          },
        });
      }

      return { previousCart };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.all, data);
      toast.success(data.message || "Product removed from cart");
    },
    onError: (error: any, _, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.all, context.previousCart);
      }
      toast.error(error.response?.data?.message || "Failed to remove product");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
};

// Clear Cart Hook
export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.all, data);
      toast.success(data.message || "Cart cleared");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to clear cart");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
};

// Apply Coupon Hook
export const useApplyCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => cartService.applyCoupon(code),
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.all, data);
      if (data.discount) {
        toast.success(
          `${data.message} - You saved $${data.discount.toFixed(2)}!`
        );
      } else {
        toast.success(data.message || "Coupon applied");
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Invalid coupon code");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
};

// Remove Coupon Hook
export const useRemoveCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.removeCoupon(),
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.all, data);
      toast.success(data.message || "Coupon removed");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to remove coupon");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
};

// Validate Cart Hook
export const useValidateCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.validateCart(),
    onSuccess: (data) => {
      if (!data.valid) {
        toast.error(data.message);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Cart validation failed");
    },
  });
};

// Merge Guest Cart Hook
export const useMergeGuestCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (guestCartItems: GuestCartItem[]) =>
      cartService.mergeGuestCart(guestCartItems),
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.all, data);
      toast.success(data.message || "Cart merged");
      // Clear local guest cart
      localStorage.removeItem("guestCart");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to merge carts");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
};

// Custom hook for cart operations
export const useCartOperations = () => {
  const queryClient = useQueryClient();
  const addToCart = useAddToCart();
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();
  const applyCoupon = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();

  const refreshCart = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: cartKeys.all });
  }, [queryClient]);

  return {
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    refreshCart,
    isLoading:
      addToCart.isPending ||
      updateCartItem.isPending ||
      removeFromCart.isPending ||
      clearCart.isPending ||
      applyCoupon.isPending ||
      removeCoupon.isPending,
  };
};