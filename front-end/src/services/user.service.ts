/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from '@/lib/apiClient'; 
import { TicketResponse } from '@/types/ticket';

export interface UserProfile {
  MaNguoiDung: string;
  HoTen: string;
  Email: string;
  SoDienThoai: string | null;
  AvatarUrl: string | null;
  VaiTro: string;
  MaNhomNguoiDung: string | null;
  NhomNguoiDung: {
    MaNhomNguoiDung: string;
    TenNhomNguoiDung: string;
    QuyenNhomNguoiDungs: {
      MaQuyenNhomNguoiDung: string;
      MaNhomNguoiDung: string;
      Quyen: string;
    }[];
  } | null;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
}

export interface UpdateProfileData {
  HoTen?: string;
  SoDienThoai?: string;
  AvatarUrl?: string | null;
  MatKhau?: string;
}

export const getMyProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get<UserProfile>('/users/me');
  return response.data;
};

export const updateMyProfile = async (
  data: FormData,
): Promise<{ message: string; data: UserProfile }> => {
  try {
    const response = await apiClient.patch<{ message: string; data: UserProfile }>('/users/me', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Update profile error response:", error.response?.data);
    throw error;
  }
};

export const changePassword = async (data: { MatKhauCu: string, MatKhauMoi: string }) => {
  const response = await apiClient.post('/users/change-password', data);
  return response.data;
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  const response = await apiClient.get<UserProfile[]>('/users');
  return response.data;
};

export const getMyTickets = async (): Promise<TicketResponse[]> => {
  const response = await apiClient.get<any>('/invoices');
  const data = response.data;
  return Array.isArray(data) ? data : data.data || [];
};

export const userService = {
  getAllUsers: async () => {
    return await getAllUsers();
  },
  
  assignEmployee: async (data: any) => {
    const response = await apiClient.post('/users/assign-employee', data);
    return response.data;
  },

  assignGroup: async (data: { userId: string, groupId: string }) => {
    const response = await apiClient.post('/users/assign-group', data);
    return response.data;
  },

  lockUser: async (id: string) => {
    const response = await apiClient.patch(`/users/${id}/lock`);
    return response.data;
  },

  unlockUser: async (id: string) => {
    const response = await apiClient.patch(`/users/${id}/unlock`);
    return response.data;
  }
};