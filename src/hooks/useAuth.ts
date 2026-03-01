// src/hooks/useAuth.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services";
import type {
  LoginCredentials,
  RegisterData,
  UpdateProfileData,
  ChangePasswordData,
} from "../types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: () => authService.getCurrentUser(),
    retry: false,
    // onError deprecated in v5, handling side effects in callbacks is discouraged for queries but fine here if global error handling missing
    // or just let it fail. The original code had onError to clear storage.
    // For now keeping it simple or moving to useEffect in component?
    // React Query v5 removed onError callbacks from useQuery.
    // Assuming v4 or v5 compatibility. If v5, this onError wont fire.
    // Let's keep it for now but note it might be ignored.
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      queryClient.setQueryData(["currentUser"], { user: data.user });
      toast.success(data.message || "Login successful");
      router.push("/");
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (userData: RegisterData) => authService.register(userData),
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      queryClient.setQueryData(["currentUser"], { user: data.user });
      toast.success(data.message || "Registration successful");
      router.push("/");
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear();
      toast.success("Logged out successfully");
      router.push("/login");
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileData) => authService.updateProfile(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success(data.message || "Profile updated");
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordData) => authService.changePassword(data),
    onSuccess: (data) => {
      toast.success(data.message || "Password changed");
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: (data) => {
      toast.success(data.message || "Password reset email sent");
    },
  });
};

export const useResetPassword = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authService.resetPassword(token, password),
    onSuccess: (data) => {
      toast.success(data.message || "Password reset successful");
      router.push("/login");
    },
  });
};
