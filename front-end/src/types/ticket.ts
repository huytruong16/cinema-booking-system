export interface TicketResponse {
  MaHoaDon: string;
  Code: string;
  Email: string;
  Phim: {
    TenPhim?: string;
    PosterUrl?: string;
  };
  ThoiGianChieu?: string;
  PhongChieu?: string;
  Ves: {
    SoGhe: string;
    TrangThai: string;
    DonGia: number;
  }[];
  Combos: {
    TenCombo: string;
    SoLuong: number;
    DonGia: number;
  }[];
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
