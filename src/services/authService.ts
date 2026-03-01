// src/api/services/authService.ts
import axiosInstance from "../lib/axios";
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  UpdateProfileData,
  ChangePasswordData,
} from "../types";

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post("/api/auth/login", credentials);
    return data;
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post("/api/auth/register", userData);
    return data;
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    const { data } = await axiosInstance.post("/api/auth/logout");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    return data;
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    const { data } = await axiosInstance.get("/api/auth/me");
    return data;
  },

  updateProfile: async (
    payload: UpdateProfileData
  ): Promise<{ user: User; message: string }> => {
    const { data } = await axiosInstance.put("/api/auth/profile", payload);
    return data;
  },

  changePassword: async (
    payload: ChangePasswordData
  ): Promise<{ success: boolean; message: string }> => {
    const { data } = await axiosInstance.put(
      "/api/auth/change-password",
      payload
    );
    return data;
  },

  forgotPassword: async (
    email: string
  ): Promise<{ success: boolean; message: string }> => {
    const { data } = await axiosInstance.post("/api/auth/forgot-password", {
      email,
    });
    return data;
  },

  resetPassword: async (
    token: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    const { data } = await axiosInstance.post("/api/auth/reset-password", {
      token,
      password,
    });
    return data;
  },
};
