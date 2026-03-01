// src/hooks/useCategories.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../services';
import toast from 'react-hot-toast';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });
};

export const useActiveCategories = () => {
  return useQuery({
    queryKey: ['categories', 'active'],
    queryFn: () => categoryService.getActiveCategories(),
  });
};

export const useMainCategoriesWithSubs = () => {
  return useQuery({
    queryKey: ['categories', 'main-with-subs'],
    queryFn: () => categoryService.getMainCategoriesWithSubs(),
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => categoryService.getCategory(id),
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => categoryService.createCategory(formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(data.message || 'Category created successfully');
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      categoryService.updateCategory(id, formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category'] });
      toast.success(data.message || 'Category updated successfully');
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(data.message || 'Category deleted successfully');
    },
  });
};