import apiClient from "@/lib/apiClient";

// --- Interfaces ---

export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface InvoiceItem {
  TenCombo?: string;
  SoLuong?: number;
  SoGhe?: string;
  TrangThai?: string;
}

export interface Invoice {
  MaHoaDon: string;
  TongTien: number;
  // Các trường Backend hiện tại chưa trả về (Optional để tránh lỗi)
  ThanhTien?: number; 
  TrangThai?: TransactionStatus;
  PhuongThucThanhToan?: string;
  NgayTao?: string; // Mapped from ThoiGianChieu or fallback
  NguoiDung?: {
    HoTen: string;
    Email: string;
    SoDienThoai: string;
  };
  NhanVien?: {
    HoTen: string;
  };
  Phim?: {
    TenPhim: string;
    PosterUrl: string;
  };
  PhongChieu?: string;
  Ves?: InvoiceItem[];
  Combos?: InvoiceItem[];
}

export interface GetInvoicesParams {
  limit?: number;
  cursor?: string;
  // Các field lọc bên dưới Backend chưa hỗ trợ nên sẽ bị lờ đi ở service
  search?: string;     
  fromDate?: string;   
  toDate?: string;     
  status?: TransactionStatus;
}

export interface InvoiceResponse {
  data: Invoice[];
  pagination: {
    nextCursor?: string;
    hasNextPage: boolean;
  };
}

// --- Service ---

export const invoiceService = {
  // Lấy danh sách hóa đơn
  getAll: async (params: GetInvoicesParams) => {
    // 🔴 QUAN TRỌNG: Chỉ lấy limit và cursor để tránh lỗi 400 từ Backend
    const validParams = {
      limit: params.limit || 10,
      cursor: params.cursor
    };
    
    const res = await apiClient.get<InvoiceResponse>('/invoices', { params: validParams });
    return res.data;
  },

  // Lấy chi tiết hóa đơn
  getById: async (id: string) => {
    const res = await apiClient.get<Invoice>(`/invoices/${id}`);
    return res.data;
  },
};