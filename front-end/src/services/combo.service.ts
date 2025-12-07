import apiClient from '@/lib/apiClient';

export interface Combo {
  MaCombo: string; 
  TenCombo: string;
  MoTa: string | null;
  GiaTien: number; 
  TrangThai: "CONHANG" | "HETHANG";
  HinhAnh: string | null;
}

export const comboService = {
  // 1. Lấy danh sách combo
  getAll: async () => {
    const res = await apiClient.get<Combo[]>('/combos');
    return res.data;
  },

  // 2. Tạo combo mới
  create: async (formData: FormData) => {
    const res = await apiClient.post('/combos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // 3. Cập nhật combo
  update: async (id: string, formData: FormData) => {
    const res = await apiClient.patch(`/combos/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // 4. Xóa combo
  delete: async (id: string) => {
    const res = await apiClient.delete(`/combos/${id}`);
    return res.data;
  }
};