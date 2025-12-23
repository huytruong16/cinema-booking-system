/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from '@/lib/apiClient';
import { TicketResponse } from '@/types/ticket';

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
  }
};


  getAll: async (params?: GetInvoicesParams) => {
    const res = await apiClient.get('/invoices', { params: { limit: 20, ...params } });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/invoices/${id}`);
    return res.data;
  },

  printInvoice: async (code: string) => {
    const res = await apiClient.get(`/invoices/${code}/ticket/pdf`, {
      responseType: 'blob', 
    });
    return res.data; 
  },

  createRefundRequest: async (payload: RefundRequestPayload) => {
    return await apiClient.post('/refund-requests', payload);
  },
};
