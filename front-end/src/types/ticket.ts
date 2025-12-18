export interface TicketResponse {
  MaHoaDon: string;
  Phim: {
    TenPhim: string;
    PosterUrl: string;
  };
  ThoiGianChieu: string;
  PhongChieu: string;
  TrangThaiThanhToan: string;
  Ves: {
    SoGhe: string;
    TrangThai: string;
  }[];
  Combos: {
    TenCombo: string;
    SoLuong: number;
  }[];
  TongTien: number;
}
