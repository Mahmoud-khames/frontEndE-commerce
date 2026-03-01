// src/api/services/orderService.ts
import axiosInstance from "../lib/axios";
import type {
  OrderResponse,
  OrdersResponse,
  CreateOrderPayload,
  OrderTrackingInfo,
  OrderStats,
  PaginationParams,
} from "../types";

interface OrderParams extends PaginationParams {
  status?: string;
}

export const orderService = {
  getUserOrders: async (params?: OrderParams): Promise<OrdersResponse> => {
    const { data } = await axiosInstance.get("/api/order/user", { params });
    return data;
  },

  getOrder: async (id: string): Promise<OrderResponse> => {
    const { data } = await axiosInstance.get(`/api/order/${id}`);
    return data;
  },

  getOrderByNumber: async (orderNumber: string): Promise<OrderResponse> => {
    const { data } = await axiosInstance.get(
      `/api/order/number/${orderNumber}`
    );
    return data;
  },

  createOrder: async (
    orderData: CreateOrderPayload
  ): Promise<OrderResponse> => {
    const { data } = await axiosInstance.post("/api/order", orderData);
    return data;
  },

  trackOrder: async (
    orderNumber: string
  ): Promise<{ data: OrderTrackingInfo }> => {
    const { data } = await axiosInstance.get(`/api/order/track/${orderNumber}`);
    return data;
  },

  cancelOrder: async (id: string, reason: string): Promise<OrderResponse> => {
    const { data } = await axiosInstance.post(`/api/order/${id}/cancel`, {
      reason,
    });
    return data;
  },

  requestReturn: async (id: string, reason: string): Promise<OrderResponse> => {
    const { data } = await axiosInstance.post(`/api/order/${id}/return`, {
      reason,
    });
    return data;
  },

  // Admin
  getAllOrders: async (params?: OrderParams): Promise<OrdersResponse> => {
    const { data } = await axiosInstance.get("/api/order", { params });
    return data;
  },

  getOrdersCount: async (): Promise<OrderStats> => {
    const { data } = await axiosInstance.get("/api/order/dashboard/count");
    return data;
  },

  updateOrderStatus: async (
    id: string,
    status: string,
    note?: string
  ): Promise<OrderResponse> => {
    const { data } = await axiosInstance.patch(`/api/order/${id}/status`, {
      status,
      note,
    });
    return data;
  },

  deleteOrder: async (id: string): Promise<OrderResponse> => {
    const { data } = await axiosInstance.delete(`/api/order/${id}`);
    return data;
  },
};
