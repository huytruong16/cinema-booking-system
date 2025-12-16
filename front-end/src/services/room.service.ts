import api from "@/lib/apiClient";

export interface ScreeningRoom {
  MaPhongChieu: string;
  TenPhongChieu: string;
  SucChua?: number; 
  TrangThai?: string;
}

export const roomService = {
  getAll: async () => {
    const res = await api.get<ScreeningRoom[]>("/screening-rooms");
    return res.data;
  },
};