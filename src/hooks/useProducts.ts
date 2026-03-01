// src/hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services';
import type { ProductFilters } from '../types';
import toast from 'react-hot-toast';

export const useProducts = (params?: ProductFilters) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getProducts(params),
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProduct(id),
    enabled: !!id,
  });
};

export const useProductBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['product', 'slug', slug],
    queryFn: () => productService.getProductBySlug(slug),
    enabled: !!slug,
  });
};

export const useSearchProducts = (query: string, params?: ProductFilters) => {
  return useQuery({
    queryKey: ['products', 'search', query, params],
    queryFn: () => productService.searchProducts(query, params),
    enabled: query.length > 0,
  });
};

export const useFilterProducts = (filters: ProductFilters) => {
  return useQuery({
    queryKey: ['products', 'filter', filters],
    queryFn: () => productService.filterProducts(filters),
  });
};

export const useNewProducts = () => {
  return useQuery({
    queryKey: ['products', 'new'],
    queryFn: () => productService.getNewProducts(),
  });
};

export const useDiscountedProducts = () => {
  return useQuery({
    queryKey: ['products', 'discounted'],
    queryFn: () => productService.getDiscountedProducts(),
  });
};

export const useBestSellingProducts = (limit = 8) => {
  return useQuery({
    queryKey: ['products', 'bestselling', limit],
    queryFn: () => productService.getBestSellingProducts(limit),
  });
};

export const useAvailableFilters = () => {
  return useQuery({
    queryKey: ['products', 'filters'],
    queryFn: () => productService.getAvailableFilters(),
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => productService.createProduct(formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(data.message || 'Product created successfully');
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, formData }: { slug: string; formData: FormData }) =>
      productService.updateProduct(slug, formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      toast.success(data.message || 'Product updated successfully');
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => productService.deleteProduct(slug),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(data.message || 'Product deleted successfully');
    },
  });
};