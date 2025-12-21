export interface DashboardSummary {
  LoaiThongKe: string;
  NgayBatDau: string;
  NgayKetThuc: string;
  TongDoanhThu: number;
  DoanhThuVe: number;
  SoVeDaBan: number;
  TiLeLapDay: number;
  DoanhThuCombo: number;
  SoSanh?: {
    DoanhThuVe: number;
    SoVeDaBan: number;
  };
}

export interface RevenueChartData {
  date: string; 
  revenue: number;
}

export interface TopMovie {
  id: number;
  name: string;
  image: string;
  revenue: number;
  ticketCount: number;
  rating: number;
}

export interface TopStaff {
  id: number;
  name: string;
  avatar: string;
  revenue: number;
  ticketCount: number;
  rank: string; 
}

export interface RoomStatus {
  id: number;
  name: string;
  status: "active" | "maintenance" | "closed" | "screening";
  currentMovie?: string;
  currentShowtime?: string;
  totalSeats: number;
  bookedSeats: number;
}