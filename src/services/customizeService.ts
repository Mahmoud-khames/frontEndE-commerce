// src/api/services/customizeService.ts
import axiosInstance from "../lib/axios";
import type {
  CustomizeResponse,
  CustomizesResponse,
  SliderType,
  Customize,
} from "../types";

export interface CustomizeQueryParams {
  perPage?: number;
  page?: number;
  type?: SliderType;
  isActive?: boolean;
  includeInactive?: boolean;
}

export const customizeService = {
  // ==================== Public Routes ====================

  // Get active slides (public)
  getActiveSlides: async (type?: SliderType): Promise<CustomizesResponse> => {
    const { data } = await axiosInstance.get("/api/customize/active", {
      params: type ? { type } : undefined,
    });
    return data;
  },

  // Get slides for homepage (alias)
  getSlides: async (): Promise<CustomizesResponse> => {
    const { data } = await axiosInstance.get("/api/customize");
    return data;
  },

  // ==================== Admin Routes ====================

  // Get all slides (admin)
  getAllSlides: async (
    params: CustomizeQueryParams = {}
  ): Promise<CustomizesResponse> => {
    const { data } = await axiosInstance.get("/api/customize/admin/all", {
      params,
    });
    return data;
  },

  // Get slide by ID
  getSlide: async (id: string): Promise<CustomizeResponse> => {
    const { data } = await axiosInstance.get(`/api/customize/${id}`);
    return data;
  },

  // Create new slide
  createSlide: async (formData: FormData): Promise<CustomizeResponse> => {
    const { data } = await axiosInstance.post("/api/customize", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  // Update slide
  updateSlide: async (
    id: string,
    formData: FormData
  ): Promise<CustomizeResponse> => {
    const { data } = await axiosInstance.put(`/api/customize/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  // Delete slide
  deleteSlide: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const { data } = await axiosInstance.delete(`/api/customize/${id}`);
    return data;
  },

  // Add image to slide
  addImage: async (
    formData: FormData
  ): Promise<{
    success: boolean;
    image: { url: string; altEn?: string; altAr?: string; order: number };
    message: string;
  }> => {
    const { data } = await axiosInstance.post(
      "/api/customize/image/add",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return data;
  },

  // Delete image from slide
  deleteImage: async (
    id: string,
    imageIndex: number
  ): Promise<{ success: boolean; message: string }> => {
    const { data } = await axiosInstance.delete("/api/customize/image/delete", {
      data: { id, imageIndex },
    });
    return data;
  },

  // Reorder images within a slide
  reorderImages: async (
    id: string,
    orderedImages: string[]
  ): Promise<{ success: boolean; message: string }> => {
    const { data } = await axiosInstance.post(
      `/api/customize/${id}/images/reorder`,
      { orderedImages }
    );
    return data;
  },

  // Toggle slide active status
  toggleActiveStatus: async (id: string): Promise<CustomizeResponse> => {
    const { data } = await axiosInstance.patch(
      `/api/customize/${id}/toggle-status`
    );
    return data;
  },

  // Reorder slides
  reorderSlides: async (
    orderedIds: string[]
  ): Promise<{ success: boolean; message: string }> => {
    const { data } = await axiosInstance.post("/api/customize/reorder", {
      orderedIds,
    });
    return data;
  },

  // Duplicate slide
  duplicateSlide: async (id: string): Promise<CustomizeResponse> => {
    const { data } = await axiosInstance.post(`/api/customize/${id}/duplicate`);
    return data;
  },
};

export default customizeService;