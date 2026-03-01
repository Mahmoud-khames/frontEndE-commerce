import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services/userService";
import { toast } from "react-toastify";

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: userService.getUsers,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: FormData) => userService.createUser(userData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(data.message || "User created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create user");
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: FormData }) =>
      userService.updateUser(id, userData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(data.message || "User updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update user");
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(data.message || "User deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete user");
    },
  });
};
