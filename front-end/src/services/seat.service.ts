import api from "@/lib/apiClient";

export interface UpdateSeatDto {
  MaLoaiGhe?: string;
  TrangThai?: string;
}

export const seatService = {
  // Cập nhật thông tin 1 ghế
  update: async (id: string, data: UpdateSeatDto) => {
    const res = await api.patch(`/seats/${id}`, data);
    return res.data;
  },
  
};