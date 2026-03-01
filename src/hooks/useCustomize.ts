// src/hooks/useCustomize.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  customizeService,
  CustomizeQueryParams,
} from "@/services/customizeService";
import type { Customize, SliderType } from "@/types";

// ==================== Query Keys ====================
export const customizeKeys = {
  all: ["customize"] as const,
  lists: () => [...customizeKeys.all, "list"] as const,
  list: (params: CustomizeQueryParams) =>
    [...customizeKeys.lists(), params] as const,
  active: (type?: SliderType) => [...customizeKeys.all, "active", type] as const,
  public: () => [...customizeKeys.all, "public"] as const,
  details: () => [...customizeKeys.all, "detail"] as const,
  detail: (id: string) => [...customizeKeys.details(), id] as const,
};

// ==================== Query Hooks ====================

/**
 * Get active slides (public)
 */
export const useActiveSlides = (type?: SliderType) => {
  return useQuery({
    queryKey: customizeKeys.active(type),
    queryFn: () => customizeService.getActiveSlides(type),
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get slides for homepage
 */
export const useSlides = () => {
  return useQuery({
    queryKey: customizeKeys.public(),
    queryFn: () => customizeService.getSlides(),
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get all slides (admin)
 */
export const useAllSlides = (params: CustomizeQueryParams = {}) => {
  return useQuery({
    queryKey: customizeKeys.list(params),
    queryFn: () => customizeService.getAllSlides(params),
    select: (data) => ({
      slides: data.data,
      pagination: data.pagination,
      count: data.count,
    }),
  });
};

/**
 * Get slide by ID
 */
export const useSlide = (id: string) => {
  return useQuery({
    queryKey: customizeKeys.detail(id),
    queryFn: () => customizeService.getSlide(id),
    select: (data) => data.data,
    enabled: !!id,
  });
};

// ==================== Mutation Hooks ====================

/**
 * Create new slide
 */
export const useCreateSlide = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => customizeService.createSlide(formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: customizeKeys.all });
      toast.success(data.message || "Slide created successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || error.message || "Failed to create slide"
      );
    },
  });
};

/**
 * Update slide
 */
export const useUpdateSlide = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      customizeService.updateSlide(id, formData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: customizeKeys.all });
      queryClient.invalidateQueries({
        queryKey: customizeKeys.detail(variables.id),
      });
      toast.success(data.message || "Slide updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || error.message || "Failed to update slide"
      );
    },
  });
};

/**
 * Delete slide
 */
export const useDeleteSlide = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customizeService.deleteSlide(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: customizeKeys.all });
      toast.success(data.message || "Slide deleted successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || error.message || "Failed to delete slide"
      );
    },
  });
};

/**
 * Add image to slide
 */
export const useAddImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => customizeService.addImage(formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: customizeKeys.all });
      toast.success(data.message || "Image added successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || error.message || "Failed to add image"
      );
    },
  });
};

/**
 * Delete image from slide
 */
export const useDeleteImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, imageIndex }: { id: string; imageIndex: number }) =>
      customizeService.deleteImage(id, imageIndex),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: customizeKeys.all });
      toast.success(data.message || "Image deleted successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || error.message || "Failed to delete image"
      );
    },
  });
};

/**
 * Reorder images within a slide
 */
export const useReorderImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      orderedImages,
    }: {
      id: string;
      orderedImages: string[];
    }) => customizeService.reorderImages(id, orderedImages),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: customizeKeys.all });
      toast.success(data.message || "Images reordered successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to reorder images"
      );
    },
  });
};

/**
 * Toggle slide active status
 */
export const useToggleActiveStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customizeService.toggleActiveStatus(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: customizeKeys.all });
      toast.success(data.message || "Status toggled successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to toggle status"
      );
    },
  });
};

/**
 * Reorder slides
 */
export const useReorderSlides = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderedIds: string[]) =>
      customizeService.reorderSlides(orderedIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: customizeKeys.all });
      toast.success(data.message || "Slides reordered successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to reorder slides"
      );
    },
  });
};

/**
 * Duplicate slide
 */
export const useDuplicateSlide = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customizeService.duplicateSlide(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: customizeKeys.all });
      toast.success(data.message || "Slide duplicated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to duplicate slide"
      );
    },
  });
};

// ==================== Combined Hook ====================

/**
 * Combined hook for all customize operations
 */
export const useCustomize = () => {
  const queryClient = useQueryClient();

  // Mutations
  const createSlide = useCreateSlide();
  const updateSlide = useUpdateSlide();
  const deleteSlide = useDeleteSlide();
  const addImage = useAddImage();
  const deleteImage = useDeleteImage();
  const reorderImages = useReorderImages();
  const toggleStatus = useToggleActiveStatus();
  const reorderSlides = useReorderSlides();
  const duplicateSlide = useDuplicateSlide();

  // Invalidate all customize queries
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: customizeKeys.all });
  };

  // Check if any mutation is loading
  const isLoading =
    createSlide.isPending ||
    updateSlide.isPending ||
    deleteSlide.isPending ||
    addImage.isPending ||
    deleteImage.isPending ||
    reorderImages.isPending ||
    toggleStatus.isPending ||
    reorderSlides.isPending ||
    duplicateSlide.isPending;

  return {
    // Mutations
    createSlide,
    updateSlide,
    deleteSlide,
    addImage,
    deleteImage,
    reorderImages,
    toggleStatus,
    reorderSlides,
    duplicateSlide,

    // Utils
    invalidateAll,

    // Loading states
    isLoading,
    isCreating: createSlide.isPending,
    isUpdating: updateSlide.isPending,
    isDeleting: deleteSlide.isPending,
    isAddingImage: addImage.isPending,
    isDeletingImage: deleteImage.isPending,
    isReorderingImages: reorderImages.isPending,
    isTogglingStatus: toggleStatus.isPending,
    isReorderingSlides: reorderSlides.isPending,
    isDuplicating: duplicateSlide.isPending,
  };
};

export default useCustomize;