import { TicketStatusEnum, TransactionStatusEnum } from "src/libs/common/enums";
import VoucherTargetEnum from "src/libs/common/enums/voucher_target.enum";

export default class GetInvoiceResponseDto {
    MaHoaDon: string;
    Code: string;
    Email: string;
    Phim: Film;
    ThoiGianChieu: Date;
    PhongChieu: string;
    Ves: Ve[];
    Combos: Combo[];
    KhuyenMais: KhuyenMai[];
    NgayLap: Date;
    TrangThaiGiaoDich: TransactionStatusEnum;
    TongTien: number;
}

class Combo {
    TenCombo: string;
    SoLuong: number;
    DonGia: number;
}

class Film {
    TenPhim: string;
    PosterUrl: string | null;
}

class Ve {
    SoGhe: string;
    TrangThai: TicketStatusEnum;
    DonGia: number;
}

class KhuyenMai {
    TenKhuyenMai: string;
    LoaiKhuyenMai: VoucherTargetEnum;
    SoTienGiam: number;
}