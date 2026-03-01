// src/api/services/couponService.ts
import axiosInstance from "../lib/axios";
import type {
  Coupon,
  CouponResponse,
  CouponsResponse,
  CouponValidation,
  ApplyCouponResponse,
  CreateCouponPayload,
  PaginationParams,
} from "@/types";

class CouponServiceClass {
  // ==================== Public Methods ====================
  
  async getActiveCoupons(): Promise<CouponsResponse> {
    const { data } = await axiosInstance.get("/api/coupon/active");
    return data;
  }

  async getCouponByCode(code: string): Promise<CouponResponse> {
    const { data } = await axiosInstance.get(`/api/coupon/code/${code}`);
    return data;
  }

  async validateCoupon(
    code: string,
    cartData: { 
      subtotal: number; 
      items: unknown[]; 
      paymentMethod?: string 
    }
  ): Promise<CouponValidation> {
    const { data } = await axiosInstance.post(
      `/api/coupon/validate/${code}`,
      cartData
    );
    return data;
  }

  async applyCoupon(
    code: string,
    cartData: { 
      subtotal: number; 
      items: unknown[]; 
      paymentMethod?: string 
    }
  ): Promise<ApplyCouponResponse> {
    const { data } = await axiosInstance.post(
      `/api/coupon/apply/${code}`,
      cartData
    );
    return data;
  }

  async calculateDiscount(
    code: string,
    total: number
  ): Promise<{
    discount: number;
    discountedTotal: number;
    discountPercentage?: number;
    discountType: string;
    error?: string;
  }> {
    const { data } = await axiosInstance.get(`/api/coupon/calculate/${code}`, {
      params: { total },
    });
    return data;
  }

  // ==================== Admin Methods ====================
  
  async getAllCoupons(params?: PaginationParams): Promise<CouponsResponse> {
    const { data } = await axiosInstance.get("/api/coupon", { params });
    return data;
  }

  async getCouponById(id: string): Promise<CouponResponse> {
    const { data } = await axiosInstance.get(`/api/coupon/${id}`);
    return data;
  }

  async createCoupon(payload: CreateCouponPayload): Promise<CouponResponse> {
    const { data } = await axiosInstance.post("/api/coupon", payload);
    return data;
  }

  async updateCoupon(
    id: string,
    payload: Partial<CreateCouponPayload>
  ): Promise<CouponResponse> {
    const { data } = await axiosInstance.put(`/api/coupon/${id}`, payload);
    return data;
  }

  async deleteCoupon(id: string): Promise<{ success: boolean; message: string }> {
    const { data } = await axiosInstance.delete(`/api/coupon/${id}`);
    return data;
  }

  async toggleCouponStatus(id: string): Promise<CouponResponse> {
    const { data } = await axiosInstance.patch(`/api/coupon/${id}/toggle-status`);
    return data;
  }

  async duplicateCoupon(id: string): Promise<CouponResponse> {
    const { data } = await axiosInstance.post(`/api/coupon/${id}/duplicate`);
    return data;
  }

  async getCouponStats(): Promise<{
    success: boolean;
    stats: {
      total: number;
      active: number;
      expired: number;
      totalUsage: number;
      totalDiscount: number;
    };
  }> {
    const { data } = await axiosInstance.get("/api/coupon/admin/stats");
    return data;
  }

  async getCouponUsageHistory(id: string): Promise<{
    success: boolean;
    usage: Array<{
      user: { _id: string; firstName: string; lastName: string; email: string };
      usedCount: number;
      usedAt: string;
    }>;
    totalUses: number;
  }> {
    const { data } = await axiosInstance.get(`/api/coupon/${id}/usage-history`);
    return data;
  }
}

export const couponService = new CouponServiceClass();