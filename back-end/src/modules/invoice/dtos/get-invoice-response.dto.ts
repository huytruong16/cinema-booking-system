import { TicketStatusEnum, TransactionStatusEnum } from "src/libs/common/enums";

export default class GetInvoiceResponseDto {
    MaHoaDon: string;
    Code: string;
    Email: string;
    Phim: Film;
    ThoiGianChieu: Date;
    PhongChieu: string;
    Ves: Ve[];
    Combos: Combo[];
    NgayLap: Date;
    TrangThaiGiaoDich: TransactionStatusEnum;
    TongTien: number;
}

class Combo {
    TenCombo: string;
    SoLuong: number;
}

class Film {
    TenPhim: string;
    PosterUrl: string | null;
}

class Ve {
    SoGhe: string;
    TrangThai: TicketStatusEnum;
}