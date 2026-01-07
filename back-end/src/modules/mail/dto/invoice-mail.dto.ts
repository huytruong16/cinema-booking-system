import { Decimal } from '@prisma/client/runtime/library';

export class TransactionDto {
  GiaoDich: {
    NgayGiaoDich: string;
    HoaDon: InvoiceDto;
  };
}

export class InvoiceDto {
  TongTien: Decimal;
  Email: string;
  Code: string;
  HoaDonCombos: InvoiceComboDto[];
  Ves: TicketDto[];
}

export class InvoiceComboDto {
  SoLuong: number;
  DonGia: Decimal;
  Combo: {
    TenCombo: string;
  };
}

export class TicketDto {
  GiaVe: Decimal;
  GheSuatChieu: SeatScreeningDto;
}

export class SeatScreeningDto {
  GhePhongChieu: {
    GheLoaiGhe: {
      Ghe: SeatDto;
    };
  };
}

export class SeatDto {
  Hang: string;
  Cot: string;
}

export class ShowtimeDto {
  ThoiGianBatDau: string;
  PhienBanPhim: MovieVersionDto;
  PhongChieu: {
    TenPhongChieu: string;
  };
}

export class MovieVersionDto {
  Phim: MovieDto;
}

export class MovieDto {
  TenHienThi: string;
  PosterUrl?: string;
  DinhDang: {
    TenDinhDang: string;
  };
  NgonNgu: {
    TenNgonNgu?: string;
  };
  NhanPhim: {
    TenNhanPhim?: string;
  };
}

export default class InvoiceMailDto {
  Transaction: TransactionDto;
  Showtime: ShowtimeDto;
}
