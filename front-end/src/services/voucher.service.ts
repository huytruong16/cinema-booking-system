import apiClient from '@/lib/apiClient';

export type LoaiGiamGia = "CODINH" | "PHANTRAM";
export type TrangThaiKhuyenMai = "CONHOATDONG" | "KHONGCONHOATDONG";
export type DoiTuongApDung = "VE" | "COMBO";

export interface Voucher {
  MaKhuyenMai: string; 
  TenKhuyenMai: string;
  MoTa: string | null;
  Code: string;
  LoaiGiamGia: LoaiGiamGia;
  GiaTri: number;
  NgayBatDau: string; 
  NgayKetThuc: string;
  SoLuongMa: number;
  SoLuongSuDung: number;
  GiaTriDonToiThieu: number;
  GiaTriGiamToiDa: number;
  TrangThai: TrangThaiKhuyenMai;
  DoiTuongApDung: DoiTuongApDung;
}

export interface CreateVoucherDto {
  TenKhuyenMai: string;
  MoTa?: string;
  Code: string;
  LoaiGiamGia: LoaiGiamGia;
  GiaTri: number;
  SoLuongMa: number;
  SoLuongSuDung?: number;
  GiaTriDonToiThieu?: number;
  GiaTriGiamToiDa?: number;
  NgayBatDau: string; 
  NgayKetThuc: string; 
  TrangThai: TrangThaiKhuyenMai;
  DoiTuongApDung: DoiTuongApDung;
}

export const voucherService = {
  // 1. Lấy danh sách
  getAll: async () => {
    const res = await apiClient.get<Voucher[]>('/vouchers');
    return res.data;
  },

  // 2. Lấy chi tiết
  getById: async (id: string) => {
    const res = await apiClient.get<Voucher>(`/vouchers/${id}`);
    return res.data;
  },

  // 3. Tạo mới
  create: async (data: CreateVoucherDto) => {
    const res = await apiClient.post('/vouchers', data);
    return res.data;
  },

  // 4. Cập nhật
  update: async (id: string, data: Partial<CreateVoucherDto>) => {
    const res = await apiClient.patch(`/vouchers/${id}`, data);
    return res.data;
  },

  // 5. Xóa (Soft delete)
  delete: async (id: string) => {
    const res = await apiClient.delete(`/vouchers/${id}`);
    return res.data;
  }
};