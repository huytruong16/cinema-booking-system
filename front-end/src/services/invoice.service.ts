/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from '@/lib/apiClient';

export interface CreateInvoiceDto {
  Email: string;
  LoaiGiaoDich: "TRUCTUYEN" | "TAIQUAY";
  MaGheSuatChieus: string[];
  Combos: {
    MaCombo: string;
    SoLuong: number;
  }[];
  MaVouchers: string[];
}

export interface InvoiceResponse {
  MaGiaoDich: string;
  GiaoDichUrl: string;
}

export interface InvoiceItem {
  SoGhe: string;
  TrangThai: string;
  DonGia: number;
}

export interface InvoiceCombo {
  TenCombo: string;
  SoLuong: number;
  DonGia: number;
}

export interface Invoice {
  MaHoaDon: string;
  Code: string;
  Email: string;
  Phim: {
    TenPhim?: string;
    PosterUrl?: string;
  };
  ThoiGianChieu?: string;
  PhongChieu?: string;
  Ves: InvoiceItem[];
  Combos: InvoiceCombo[];
  KhuyenMais: any[];
  NgayLap: string;
  GiaoDich: {
    MaGiaoDich: string;
    Code: string;
    NgayGiaoDich: string;
    PhuongThuc: string;
    TrangThai: string;
    LoaiGiaoDich: string;
    NoiDung: string | null;
  };
  TongTien: number;
}

export interface GetInvoicesParams {
  limit?: number;
  cursor?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
}

export interface RefundRequestPayload {
  MaHoaDon: string;
  LyDo: string;
  MaNganHang: string;
  SoTaiKhoan: string;
  ChuTaiKhoan: string;
}

export const invoiceService = {
  create: async (data: CreateInvoiceDto) => {
    const res = await apiClient.post<InvoiceResponse>('/invoices', data);
    return res.data;
  },
  getInvoiceByCode: async (code: string) => {
    const res = await apiClient.get<Blob>(`/invoices/${code}/ticket/pdf`, {
      responseType: 'blob'
    });
    return res.data;
  },
  getInvoicePdf: async (code: string) => {
    const res = await apiClient.get<Blob>(`/invoices/${code}/ticket/pdf`, {
      responseType: 'blob'
    });
    return res.data;
  },
  getAll: async (params?: GetInvoicesParams) => {
    const res = await apiClient.get('/invoices', { params: { limit: 20, ...params } });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/invoices/${id}`);
    return res.data;
  },

  printInvoice: async (code: string) => {
    const res = await apiClient.get(`/invoices/${code}/pdf`, {
      responseType: 'blob', 
    });
    return res.data; 
  },

  printTicket: async (code: string) => {
    const res = await apiClient.get(`/invoices/${code}/ticket/pdf`, {
      responseType: 'blob', 
    });
    return res.data; 
  },

  createRefundRequest: async (payload: RefundRequestPayload) => {
    return await apiClient.post('/refund-requests', payload);
  },
};
