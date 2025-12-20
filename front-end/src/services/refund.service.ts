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
  }
};
