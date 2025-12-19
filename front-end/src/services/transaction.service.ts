import apiClient from '@/lib/apiClient';

export interface Transaction {
  MaGiaoDich: string;
  MaNhanVien: string | null;
  MaHoaDon: string;
  PhuongThuc: string;
  TongTien: string;
  TrangThai: "DANGCHO" | "THANHCONG" | "THATBAI" | "HUY";
  NgayGiaoDich: string;
  NoiDung: string | null;
  LoaiGiaoDich: string;
  Code: string;
  LinkId: string;
  GiaoDichUrl: string;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
}

export const transactionService = {
  getById: async (id: string) => {
    const res = await apiClient.get<Transaction>(`/transactions/${id}`);
    return res.data;
  }
};
