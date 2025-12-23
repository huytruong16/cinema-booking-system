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

