// src/providers/AuthProvider.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import type { User, LoginCredentials, RegisterData } from "@/types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setIsInitialized(true);
  }, []);

  // Fetch current user query
  const {
    data,
    isLoading: isUserLoading,
    isError,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => authService.getCurrentUser(),
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
    retry: false,
  });

  useEffect(() => {
    if (data) {
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
  }, [data]);

  useEffect(() => {
    if (isError) {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
    }
  }, [isError]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      setUser(data.user);
      queryClient.setQueryData(["currentUser"], { user: data.user });
      toast.success(data.message || "تم تسجيل الدخول بنجاح");
      router.push("/");
    },
    onError: (error: any) => {
      toast.error(error.message || "فشل تسجيل الدخول");
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (userData: RegisterData) => authService.register(userData),
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      setUser(data.user);
      queryClient.setQueryData(["currentUser"], { user: data.user });
      toast.success(data.message || "تم إنشاء الحساب بنجاح");
      router.push("/");
    },
    onError: (error: any) => {
      toast.error(error.message || "فشل إنشاء الحساب");
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      setUser(null);
      queryClient.clear();
      toast.success("تم تسجيل الخروج بنجاح");
      router.push("/login");
    },
    onError: () => {
      // Even if API fails, clear local data
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      queryClient.clear();
      router.push("/login");
    },
  });

  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
  };

  const register = async (data: RegisterData) => {
    await registerMutation.mutateAsync(data);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    queryClient.setQueryData(["currentUser"], { user: updatedUser });
  };

  const isLoading = !isInitialized || isUserLoading;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
