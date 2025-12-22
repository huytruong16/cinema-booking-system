import { TicketStatusEnum, TransactionEnum, TransactionStatusEnum } from "src/libs/common/enums";
import VoucherTargetEnum from "src/libs/common/enums/voucher_target.enum";

export default class GetInvoiceResponseDto {
    MaHoaDon: string;
    Code: string;
    Email: string;
    Phim: Film;
    ThoiGianChieu: Date;
    PhongChieu: string;
    Ves: Ticket[];
    Combos: Combo[];
    KhuyenMais: Voucher[];
    NgayLap: Date;
    GiaoDich: Transaction;
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

class Ticket {
    Code: string;
    SoGhe: string;
    TrangThai: TicketStatusEnum;
    DonGia: number;
}

class Voucher {
    TenKhuyenMai: string;
    LoaiKhuyenMai: VoucherTargetEnum;
    SoTienGiam: number;
}

class Transaction {
    MaGiaoDich: string;
    Code: string;
    NgayGiaoDich: Date;
    PhuongThuc: TransactionEnum;
    TrangThai: TransactionStatusEnum;
    LoaiGiaoDich: string;
    NoiDung: string | null;
}