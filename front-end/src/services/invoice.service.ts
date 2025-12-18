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
  GiaoDichUrl: string;
}

export const invoiceService = {
  create: async (data: CreateInvoiceDto) => {
    const res = await apiClient.post<InvoiceResponse>('/invoices', data);
    return res.data;
  }
};
