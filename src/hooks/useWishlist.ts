// src/hooks/useWishlist.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistService } from '../services';
import toast from 'react-hot-toast';

export const useWishlist = () => {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistService.getWishlist(),
  });
};

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => wishlistService.addToWishlist(productId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success(data.message || 'Added to wishlist');
    },
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => wishlistService.removeFromWishlist(productId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success(data.message || 'Removed from wishlist');
    },
  });
};

export const useToggleWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => wishlistService.toggleWishlist(productId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success(data.message);
    },
  });
};

export const useClearWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => wishlistService.clearWishlist(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success(data.message || 'Wishlist cleared');
    },
  });
};