import apiClient from '@/lib/apiClient';

export interface Bank {
  MaNganHang: string;
  TenNganHang: string;
  Code: string;
  Logo: string;
}

export interface CreateRefundRequestDto {
  MaHoaDon: string;
  LyDo: string;
  MaNganHang: string;
  SoTaiKhoan: string;
  ChuTaiKhoan: string;
}

export const refundService = {
  getBanks: async () => {
    const res = await apiClient.get<Bank[]>('/banks');
    return res.data;
  },
  createRequest: async (data: CreateRefundRequestDto) => {
    const res = await apiClient.post('/refund-requests', data);
    return res.data;
  },
  getAll: async () => {
    const response = await apiClient.get('/refund-requests');
    return response.data;
  },
  updateStatus: async (id: string, status: string, note?: string) => {
    return await apiClient.patch(`/refund-requests/${id}/status`, {
      TrangThai: status,
      GhiChu: note
    });
  },
  approveRefund: async (payload: {
    MaYeuCauHoanTien: string;
    SoTien: number;
    PhuongThuc: string; 
    GhiChu?: string;
    MaGiaoDichNganHang?: string;
  }) => {
    return await apiClient.post('/transactions/refund', payload);
  }
};
