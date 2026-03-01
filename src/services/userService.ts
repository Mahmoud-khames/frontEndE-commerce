import axiosInstance from "../lib/axios";
import { User, ApiResponse } from "../types";

export interface UsersResponse {
  success: boolean;
  message: string;
  data: User[];
  users: User[]; // Handling potential inconsistency in backend response naming
}

export const userService = {
  getUsers: async (): Promise<UsersResponse> => {
    const { data } = await axiosInstance.get("/api/user");
    return data;
  },

  createUser: async (userData: FormData): Promise<ApiResponse<User>> => {
    const { data } = await axiosInstance.post("/api/user", userData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

  updateUser: async (
    id: string,
    userData: FormData
  ): Promise<ApiResponse<User>> => {
    const { data } = await axiosInstance.put(`/api/user/${id}`, userData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

  deleteUser: async (id: string): Promise<ApiResponse> => {
    const { data } = await axiosInstance.delete(`/api/user/${id}`);
    return data;
  },
};
