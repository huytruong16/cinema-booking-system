import api from "@/lib/apiClient";
import { Promotion, UserPromotion } from "@/types/promotion";

export interface BackendPromotion {
  MaKhuyenMai: string;
  TenKhuyenMai: string;
  MoTa: string;
  Code: string;
  LoaiGiamGia: string;      
  GiaTri: string;           
  NgayBatDau: string;
  NgayKetThuc: string;
  SoLuongMa: number;
  SoLuongSuDung: number;
  GiaTriDonToiThieu: string;
  GiaTriGiamToiDa: string;
  TrangThai: string;       
  DoiTuongApDung: string;
}

export interface BackendUserPromotion {
  MaKhuyenMaiKH: string;
  MaKhachHang: string;
  MaKhuyenMai: string;
  DaSuDung: boolean;
  KhuyenMai: BackendPromotion;
}

const mapToFrontendPromotion = (item: BackendPromotion): Promotion => {
  return {
    id: item.MaKhuyenMai,
    title: item.TenKhuyenMai,
    description: item.MoTa,
    code: item.Code,
    discountType: item.LoaiGiamGia === "PHANTRAM" ? "PERCENTAGE" : "FIXED_AMOUNT",
    value: parseFloat(item.GiaTri),
    startDate: item.NgayBatDau,
    endDate: item.NgayKetThuc,
    minOrderValue: parseFloat(item.GiaTriDonToiThieu),
    maxDiscount: parseFloat(item.GiaTriGiamToiDa),
    quantity: item.SoLuongMa,
    usedQuantity: item.SoLuongSuDung,
    status: item.TrangThai === "CONHOATDONG" ? "ACTIVE" : "INACTIVE",
    targetType: item.DoiTuongApDung,
  };
};

export const promotionService = {
  getAllPromotions: async (): Promise<Promotion[]> => {
    try {
      const response = await api.get<BackendPromotion[]>('/vouchers');
      return response.data.map(mapToFrontendPromotion);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khuyến mãi:", error);
      return [];
    }
  },

  getMyPromotions: async (): Promise<UserPromotion[]> => {
    try {
      const response = await api.get<BackendUserPromotion[]>('/vouchers/me');
      return response.data
        .filter(item => item.KhuyenMai)
        .map(item => ({
          ...mapToFrontendPromotion(item.KhuyenMai),
          userPromotionId: item.MaKhuyenMaiKH,
          isUsed: item.DaSuDung
        }));
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khuyến mãi của tôi:", error);
      return [];
    }
  },

  savePromotion: async (id: string): Promise<void> => {
    await api.post(`/vouchers/save/${id}`);
  },

  copyCode: (code: string) => {
    navigator.clipboard.writeText(code);
  }
};