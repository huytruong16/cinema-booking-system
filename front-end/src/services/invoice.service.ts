import apiClient from "@/lib/apiClient";
export interface InvoiceItem {
  MaVe?: string;
  Code?: string; 
  TenPhim?: string;
  PhongChieu?: string;
  SoGhe?: string; 
  GiaVe?: number;
  TrangThai?: string;
}

export interface InvoiceCombo {
  TenCombo?: string;
  SoLuong?: number;
  DonGia?: number;
}

export interface Invoice {
  MaHoaDon: string;
  Code: string; 
  Email?: string; 
  NgayLap?: string; 
  TongTien: number;
  TrangThai?: string; 
  
  Ves?: InvoiceItem[];
  Combos?: InvoiceCombo[];
  GiaoDichs?: any[]; 
}

export interface GetInvoicesParams {
  limit?: number;
  cursor?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
}

export const invoiceService = {
  getAll: async (params?: GetInvoicesParams) => {
    const res = await apiClient.get('/invoices', { params: { limit: 20, ...params } });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/invoices/${id}`);
    return res.data;
  },

  createRefundRequest: async (data: { Code: string[]; LyDo: string; MaNganHang?: string; SoTaiKhoan?: string; ChuTaiKhoan?: string }) => {

    const payload = {
        Code: data.Code,
        LyDo: data.LyDo,
        MaNganHang: 'e499763d-2f52-4752-b437-020556779354', 
        SoTaiKhoan: '0000000000',
        ChuTaiKhoan: 'KHACH HANG'
    };
    const res = await apiClient.post('/refund-requests', payload);
    return res.data;
  }
};