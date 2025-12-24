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

  getDetail: async (id: string) => {
    return await apiClient.get(`/refund-requests/${id}`);
  },

  approveRefund: async (data: {
    MaYeuCauHoanTien: string;
    PhuongThuc: string; 
    SoTien?: number;
    GhiChu?: string;
    MaGiaoDichNganHang?: string;
  }) => {
    const payload = {
      MaYeuCau: data.MaYeuCauHoanTien, 
      PhuongThuc: data.PhuongThuc,   
    };
    
    return await apiClient.post("/transactions/refund", payload);
  },

  updateStatus: async (id: string, status: string, note?: string) => {
    const payload = {
      TrangThai: status, 
    };
    return await apiClient.patch(`/refund-requests/status/${id}`, payload);
  },
};
