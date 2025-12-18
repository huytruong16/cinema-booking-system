import api from "@/lib/apiClient";

export interface SeatType {
  MaLoaiGhe: string;
  TenLoaiGhe: string;
  GiaGoc: number;
  MauSac?: string;
}

export const seatTypeService = {
  getAll: async () => {
    const res = await api.get<SeatType[]>('/seat-types');
    return res.data;
  }
};