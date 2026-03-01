// src/api/services/reviewService.ts
import axiosInstance from "../lib/axios";
import type {
  ReviewsResponse,
  ReviewResponse,
  CreateReviewPayload,
  UpdateReviewPayload,
  PaginationParams,
} from "../types";

interface ReviewParams extends PaginationParams {
  sort?: "newest" | "oldest" | "highest" | "lowest" | "helpful";
}

export const reviewService = {
  getProductReviews: async (
    productId: string,
    params?: ReviewParams
  ): Promise<ReviewsResponse> => {
    const { data } = await axiosInstance.get(
      `/api/review/product/${productId}`,
      {
        params,
      }
    );
    return data;
  },

  getUserReviews: async (): Promise<ReviewsResponse> => {
    const { data } = await axiosInstance.get("/api/review/my-reviews");
    return data;
  },

  createReview: async (formData: FormData): Promise<ReviewResponse> => {
    const { data } = await axiosInstance.post("/api/review", formData);
    return data;
  },

  updateReview: async (
    reviewId: string,
    formData: FormData
  ): Promise<ReviewResponse> => {
    const { data } = await axiosInstance.put(
      `/api/review/${reviewId}`,
      formData
    );
    return data;
  },

  deleteReview: async (
    reviewId: string
  ): Promise<{ success: boolean; message: string }> => {
    const { data } = await axiosInstance.delete(`/api/review/${reviewId}`);
    return data;
  },

  markHelpful: async (
    reviewId: string
  ): Promise<{ helpfulCount: number; message: string }> => {
    const { data } = await axiosInstance.post(
      `/api/review/${reviewId}/helpful`
    );
    return data;
  },

  reportReview: async (
    reviewId: string,
    reason: string
  ): Promise<{ success: boolean; message: string }> => {
    const { data } = await axiosInstance.post(
      `/api/review/${reviewId}/report`,
      {
        reason,
      }
    );
    return data;
  },
};
