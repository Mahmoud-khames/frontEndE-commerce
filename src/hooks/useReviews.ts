// src/hooks/useReviews.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '../services';
import toast from 'react-hot-toast';

interface ReviewParams {
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
}

export const useProductReviews = (productId: string, params?: ReviewParams) => {
  return useQuery({
    queryKey: ['reviews', 'product', productId, params],
    queryFn: () => reviewService.getProductReviews(productId, params),
    enabled: !!productId,
  });
};

export const useUserReviews = () => {
  return useQuery({
    queryKey: ['reviews', 'user'],
    queryFn: () => reviewService.getUserReviews(),
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => reviewService.createReview(formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      toast.success(data.message || 'Review submitted');
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, formData }: { reviewId: string; formData: FormData }) =>
      reviewService.updateReview(reviewId, formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success(data.message || 'Review updated');
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => reviewService.deleteReview(reviewId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success(data.message || 'Review deleted');
    },
  });
};

export const useMarkReviewHelpful = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => reviewService.markHelpful(reviewId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success(data.message || 'Marked as helpful');
    },
  });
};