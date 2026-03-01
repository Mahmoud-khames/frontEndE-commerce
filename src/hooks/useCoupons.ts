// src/hooks/useCoupons.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { couponService } from "@/services/couponService";
import type { CreateCouponPayload, PaginationParams } from "@/types";
import toast from "react-hot-toast";

// Query Keys
export const couponKeys = {
  all: ["coupons"] as const,
  lists: () => [...couponKeys.all, "list"] as const,
  list: (params?: PaginationParams) => [...couponKeys.lists(), params] as const,
  active: () => [...couponKeys.all, "active"] as const,
  details: () => [...couponKeys.all, "detail"] as const,
  detail: (id: string) => [...couponKeys.details(), id] as const,
  byCode: (code: string) => [...couponKeys.all, "code", code] as const,
  stats: () => [...couponKeys.all, "stats"] as const,
  usage: (id: string) => [...couponKeys.all, "usage", id] as const,
};

// ==================== Query Hooks ====================

// Get All Coupons (Admin)
export const useAllCoupons = (params?: PaginationParams) => {
  return useQuery({
    queryKey: couponKeys.list(params),
    queryFn: () => couponService.getAllCoupons(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get Active Coupons (Public)
export const useActiveCoupons = () => {
  return useQuery({
    queryKey: couponKeys.active(),
    queryFn: () => couponService.getActiveCoupons(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Get Coupon by ID
export const useCoupon = (id: string) => {
  return useQuery({
    queryKey: couponKeys.detail(id),
    queryFn: () => couponService.getCouponById(id),
    enabled: !!id,
  });
};

// Get Coupon by Code
export const useCouponByCode = (code: string) => {
  return useQuery({
    queryKey: couponKeys.byCode(code),
    queryFn: () => couponService.getCouponByCode(code),
    enabled: !!code,
  });
};

// Get Coupon Stats
export const useCouponStats = () => {
  return useQuery({
    queryKey: couponKeys.stats(),
    queryFn: () => couponService.getCouponStats(),
    staleTime: 1000 * 60 * 5,
  });
};

// Get Coupon Usage History
export const useCouponUsageHistory = (id: string) => {
  return useQuery({
    queryKey: couponKeys.usage(id),
    queryFn: () => couponService.getCouponUsageHistory(id),
    enabled: !!id,
  });
};

// ==================== Mutation Hooks ====================

// Create Coupon
export const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCouponPayload) => couponService.createCoupon(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      queryClient.invalidateQueries({ queryKey: couponKeys.stats() });
      toast.success(data.message || "Coupon created successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create coupon"
      );
    },
  });
};

// Update Coupon
export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCouponPayload> }) =>
      couponService.updateCoupon(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      queryClient.invalidateQueries({ queryKey: couponKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: couponKeys.stats() });
      toast.success(data.message || "Coupon updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update coupon"
      );
    },
  });
};

// Delete Coupon
export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => couponService.deleteCoupon(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      queryClient.invalidateQueries({ queryKey: couponKeys.stats() });
      toast.success(data.message || "Coupon deleted successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to delete coupon"
      );
    },
  });
};

// Toggle Coupon Status
export const useToggleCouponStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => couponService.toggleCouponStatus(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      queryClient.invalidateQueries({ queryKey: couponKeys.detail(id) });
      toast.success(data.message || "Coupon status updated");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update status"
      );
    },
  });
};

// Duplicate Coupon
export const useDuplicateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => couponService.duplicateCoupon(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      toast.success(data.message || "Coupon duplicated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to duplicate coupon"
      );
    },
  });
};

// Validate Coupon
export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: ({
      code,
      cartData,
    }: {
      code: string;
      cartData: { subtotal: number; items: unknown[]; paymentMethod?: string };
    }) => couponService.validateCoupon(code, cartData),
  });
};

// Apply Coupon (for checkout)
export const useApplyCouponToOrder = () => {
  return useMutation({
    mutationFn: ({
      code,
      cartData,
    }: {
      code: string;
      cartData: { subtotal: number; items: unknown[]; paymentMethod?: string };
    }) => couponService.applyCoupon(code, cartData),
    onSuccess: (data) => {
      toast.success(data.message || "Coupon applied successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to apply coupon"
      );
    },
  });
};