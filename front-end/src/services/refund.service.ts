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

export type RefundStatus = 'DANGCHO' | 'DAHOAN' | 'DAHUY';

export interface RefundRequest {
  MaYeuCau: string;
  MaHoaDon: string;
  TrangThai: RefundStatus;
  LyDoHoan: string;
  SoTien: number;
  MaNganHang?: string;
  SoTaiKhoan?: string;
  TenChuTaiKhoan?: string;
  CreatedAt: string;
  UpdatedAt?: string;
  HoaDon?: {
    MaHoaDon: string;
    TongTien: number;
  };
  NganHang?: {
    TenNganHang: string;
    Code: string;
    Logo: string;
  };
}

export interface RefundRequestsResponse {
  data: RefundRequest[];
  meta: {
    nextCursor: string | null;
    hasNextPage: boolean;
  };
}

export interface GetRefundRequestsParams {
  limit?: number;
  cursor?: string;
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
  
  // Lấy danh sách yêu cầu hoàn vé của khách hàng hiện tại
  getMyRequests: async (params?: GetRefundRequestsParams): Promise<RefundRequestsResponse> => {
    const response = await apiClient.get<RefundRequestsResponse>('/refund-requests', { params });
    const data = response.data;
    // Handle both array and paginated response
    if (Array.isArray(data)) {
      return {
        data: data,
        meta: { nextCursor: null, hasNextPage: false }
      };
    }
    return {
      data: data.data || [],
      meta: data.meta || { nextCursor: null, hasNextPage: false }
    };
  },

  getAll: async () => {
    const response = await apiClient.get('/refund-requests');
    return response.data;
  },

  getDetail: async (id: string): Promise<RefundRequest> => {
    const response = await apiClient.get<RefundRequest>(`/refund-requests/${id}`);
    return response.data;
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
