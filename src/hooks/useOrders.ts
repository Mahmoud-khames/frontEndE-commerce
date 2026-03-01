// src/hooks/useOrders.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "../services";
import type { CreateOrderPayload, PaginationParams } from "../types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface OrderParams extends PaginationParams {
  status?: string;
}

export const useUserOrders = (params?: OrderParams) => {
  return useQuery({
    queryKey: ["orders", "user", params],
    queryFn: () => orderService.getUserOrders(params),
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => orderService.getOrder(id),
    enabled: !!id,
  });
};

export const useOrderByNumber = (orderNumber: string) => {
  return useQuery({
    queryKey: ["order", "number", orderNumber],
    queryFn: () => orderService.getOrderByNumber(orderNumber),
    enabled: !!orderNumber,
  });
};

export const useTrackOrder = (orderNumber: string) => {
  return useQuery({
    queryKey: ["order", "track", orderNumber],
    queryFn: () => orderService.trackOrder(orderNumber),
    enabled: !!orderNumber,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (orderData: CreateOrderPayload) =>
      orderService.createOrder(orderData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(data.message || "Order created successfully");
      router.push(`/orders/${data.data._id}`);
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      orderService.cancelOrder(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
      toast.success(data.message || "Order cancelled");
    },
  });
};

export const useRequestReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      orderService.requestReturn(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
      toast.success(data.message || "Return requested");
    },
  });
};

// Admin Hooks
export const useAllOrders = (params?: OrderParams) => {
  return useQuery({
    queryKey: ["orders", "admin", params],
    queryFn: () => orderService.getAllOrders(params),
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      note,
    }: {
      id: string;
      status: string;
      note?: string;
    }) => orderService.updateOrderStatus(id, status, note),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
      toast.success(data.message || "Order status updated");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update order status"
      );
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orderService.deleteOrder(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] }); // Refresh list
      toast.success(data.message || "Order deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete order");
    },
  });
};
