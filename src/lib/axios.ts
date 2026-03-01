// src/api/axios.ts
import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import type { ApiError } from "../types";

const getCurrentLanguage = (): string => {
  if (typeof window !== "undefined") {
    const path = window.location.pathname;
    if (path.startsWith("/ar") || path === "/ar") return "ar";
    if (path.startsWith("/en") || path === "/en") return "en";
  }
  return localStorage.getItem("language") || "en";
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const language = getCurrentLanguage();
    if (config.headers) {
      config.headers["Accept-Language"] = language;
    }

    if (config.data instanceof FormData && config.headers) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(`${BASE_URL}/api/auth/refresh`, {
            refreshToken,
          });

          const { token } = response.data;
          localStorage.setItem("token", token);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axiosInstance(originalRequest);
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    const apiError: ApiError = {
      message:
        error.response?.data?.message || error.message || "An error occurred",
      status: error.response?.status,
      data: error.response?.data,
    };

    return Promise.reject(apiError);
  }
);

export default axiosInstance;
