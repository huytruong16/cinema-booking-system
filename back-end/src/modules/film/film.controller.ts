import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { FilmService } from './film.service';
import {
    ApiTags,
    ApiOperation,
    ApiOkResponse,
    ApiNotFoundResponse,
    ApiParam,
    ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Phim')
@Controller('films')
export class FilmController {
    constructor(private readonly filmService: FilmService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách các phim' })
    @ApiResponse({
        status: 200, example: [
            {
                "MaPhim": "a623c63d-53ed-4438-8a43-965510f52016",
                "TenGoc": "Inside Out 2",
                "TenHienThi": "Những mảnh ghép cảm xúc 2",
                "TomTatNoiDung": "Cuộc sống tuổi mới lớn của cô bé Riley lại tiếp tục trở nên hỗn loạn hơn bao giờ hết với sự xuất hiện của 4 cảm xúc hoàn toàn mới: Lo u, Ganh Tị, Xấu Hổ, Chán Nản. Mọi chuyện thậm chí còn rối rắm hơn khi nhóm cảm xúc mới này nổi loạn và nhốt nhóm cảm xúc cũ gồm Vui Vẻ, Buồn Bã, Giận Dữ, Sợ Hãi và Chán Ghét lại, khiến cô bé Riley rơi vào những tình huống dở khóc dở cười.",
                "DaoDien": "Kelsey Mann",
                "DanhSachDienVien": "Amy Poehler, Maya Hawke, Lewis Black, Phyllis Smith, Tony Hale, Liza Lapira, Ayo Edebiri, Adèle Exarchopoulos, Paul Walter Hauser,....",
                "QuocGia": "Hoa Kỳ",
                "TrailerUrl": "https://youtu.be/LEjhY15eCx0?si=CuSP-algD4HVWJd9",
                "ThoiLuong": 96,
                "NgayBatDauChieu": "2025-10-29T21:52:23.000Z",
                "NgayKetThucChieu": "2025-12-26T21:52:28.000Z",
                "DiemDanhGia": "7.5",
                "TrangThaiPhim": "DANGCHIEU",
                "CreatedAt": "2025-11-01T14:55:45.027Z",
                "UpdatedAt": "2025-11-01T14:55:45.027Z",
                "DeletedAt": null,
                "DanhGias": [
                    {
                        "MaDanhGia": "67502c0f-46ce-414b-a7ec-678fbcd0c2c5",
                        "NoiDung": "Hay tuyệt vời <3",
                        "Diem": "2",
                        "MaPhim": "a623c63d-53ed-4438-8a43-965510f52016",
                        "CreatedAt": "2025-11-02T08:02:26.602Z",
                        "UpdatedAt": "2025-11-02T08:02:26.602Z",
                        "DeletedAt": null
                    }
                ],
                "DinhDangs": [
                    {
                        "DINHDANG": {
                            "MaDinhDang": "298d831e-e0c4-4904-b815-24bd718a9b8f",
                            "TenDinhDang": "2D",
                            "GiaVe": "50000",
                            "CreatedAt": "2025-11-01T14:57:03.089Z",
                            "UpdatedAt": "2025-11-01T14:57:03.089Z",
                            "DeletedAt": null
                        }
                    },
                    {
                        "DINHDANG": {
                            "MaDinhDang": "2ea7e036-6656-4fa5-82a1-9f937840df3e",
                            "TenDinhDang": "3D",
                            "GiaVe": "71000",
                            "CreatedAt": "2025-11-01T14:57:29.306Z",
                            "UpdatedAt": "2025-11-01T14:57:29.306Z",
                            "DeletedAt": null
                        }
                    }
                ],
                "TheLoais": [
                    {
                        "THELOAI": {
                            "MaTheLoai": "f6003de3-25d4-4704-a7ca-202c6b4af531",
                            "TenTheLoai": "Hoạt hình",
                            "CreatedAt": "2025-11-01T14:56:18.359Z",
                            "UpdatedAt": "2025-11-01T14:56:18.359Z",
                            "DeletedAt": null
                        }
                    }
                ]
            }
        ]
    })
    async getAllFilms() {
        return this.filmService.getAllFilms();
    }

    @Get('format')
    @ApiOperation({ summary: 'Lấy danh sách các phim theo định dạng' })
    @ApiResponse({
        status: 200,
        example: [
            {
                "PHIM": {
                    "MaPhim": "a623c63d-53ed-4438-8a43-965510f52016",
                    "TenGoc": "Inside Out 2",
                    "TenHienThi": "Những mảnh ghép cảm xúc 2",
                    "TomTatNoiDung": "Cuộc sống tuổi mới lớn của cô bé Riley lại tiếp tục trở nên hỗn loạn hơn bao giờ hết với sự xuất hiện của 4 cảm xúc hoàn toàn mới: Lo u, Ganh Tị, Xấu Hổ, Chán Nản. Mọi chuyện thậm chí còn rối rắm hơn khi nhóm cảm xúc mới này nổi loạn và nhốt nhóm cảm xúc cũ gồm Vui Vẻ, Buồn Bã, Giận Dữ, Sợ Hãi và Chán Ghét lại, khiến cô bé Riley rơi vào những tình huống dở khóc dở cười.",
                    "DaoDien": "Kelsey Mann",
                    "DanhSachDienVien": "Amy Poehler, Maya Hawke, Lewis Black, Phyllis Smith, Tony Hale, Liza Lapira, Ayo Edebiri, Adèle Exarchopoulos, Paul Walter Hauser,....",
                    "QuocGia": "Hoa Kỳ",
                    "TrailerUrl": "https://youtu.be/LEjhY15eCx0?si=CuSP-algD4HVWJd9",
                    "ThoiLuong": 96,
                    "NgayBatDauChieu": "2025-10-29T21:52:23.000Z",
                    "NgayKetThucChieu": "2025-12-26T21:52:28.000Z",
                    "DiemDanhGia": "7.5",
                    "TrangThaiPhim": "DANGCHIEU",
                    "CreatedAt": "2025-11-01T14:55:45.027Z",
                    "UpdatedAt": "2025-11-01T14:55:45.027Z",
                    "DeletedAt": null
                },
                "DINHDANG": {
                    "MaDinhDang": "2ea7e036-6656-4fa5-82a1-9f937840df3e",
                    "TenDinhDang": "3D",
                    "GiaVe": "71000",
                    "CreatedAt": "2025-11-01T14:57:29.306Z",
                    "UpdatedAt": "2025-11-01T14:57:29.306Z",
                    "DeletedAt": null
                }
            },
            {
                "PHIM": {
                    "MaPhim": "a623c63d-53ed-4438-8a43-965510f52016",
                    "TenGoc": "Inside Out 2",
                    "TenHienThi": "Những mảnh ghép cảm xúc 2",
                    "TomTatNoiDung": "Cuộc sống tuổi mới lớn của cô bé Riley lại tiếp tục trở nên hỗn loạn hơn bao giờ hết với sự xuất hiện của 4 cảm xúc hoàn toàn mới: Lo u, Ganh Tị, Xấu Hổ, Chán Nản. Mọi chuyện thậm chí còn rối rắm hơn khi nhóm cảm xúc mới này nổi loạn và nhốt nhóm cảm xúc cũ gồm Vui Vẻ, Buồn Bã, Giận Dữ, Sợ Hãi và Chán Ghét lại, khiến cô bé Riley rơi vào những tình huống dở khóc dở cười.",
                    "DaoDien": "Kelsey Mann",
                    "DanhSachDienVien": "Amy Poehler, Maya Hawke, Lewis Black, Phyllis Smith, Tony Hale, Liza Lapira, Ayo Edebiri, Adèle Exarchopoulos, Paul Walter Hauser,....",
                    "QuocGia": "Hoa Kỳ",
                    "TrailerUrl": "https://youtu.be/LEjhY15eCx0?si=CuSP-algD4HVWJd9",
                    "ThoiLuong": 96,
                    "NgayBatDauChieu": "2025-10-29T21:52:23.000Z",
                    "NgayKetThucChieu": "2025-12-26T21:52:28.000Z",
                    "DiemDanhGia": "7.5",
                    "TrangThaiPhim": "DANGCHIEU",
                    "CreatedAt": "2025-11-01T14:55:45.027Z",
                    "UpdatedAt": "2025-11-01T14:55:45.027Z",
                    "DeletedAt": null
                },
                "DINHDANG": {
                    "MaDinhDang": "298d831e-e0c4-4904-b815-24bd718a9b8f",
                    "TenDinhDang": "2D",
                    "GiaVe": "50000",
                    "CreatedAt": "2025-11-01T14:57:03.089Z",
                    "UpdatedAt": "2025-11-01T14:57:03.089Z",
                    "DeletedAt": null
                }
            }
        ]
    })
    async getAllFilmFormats() {
        return this.filmService.getAllFilmFormats();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết phim theo mã' })
    @ApiParam({ name: 'id', description: 'Mã phim', required: true })
    @ApiResponse({
        status: 200,
        example: {
            "MaPhim": "a623c63d-53ed-4438-8a43-965510f52016",
            "TenGoc": "Inside Out 2",
            "TenHienThi": "Những mảnh ghép cảm xúc 2",
            "TomTatNoiDung": "Cuộc sống tuổi mới lớn của cô bé Riley lại tiếp tục trở nên hỗn loạn hơn bao giờ hết với sự xuất hiện của 4 cảm xúc hoàn toàn mới: Lo u, Ganh Tị, Xấu Hổ, Chán Nản. Mọi chuyện thậm chí còn rối rắm hơn khi nhóm cảm xúc mới này nổi loạn và nhốt nhóm cảm xúc cũ gồm Vui Vẻ, Buồn Bã, Giận Dữ, Sợ Hãi và Chán Ghét lại, khiến cô bé Riley rơi vào những tình huống dở khóc dở cười.",
            "DaoDien": "Kelsey Mann",
            "DanhSachDienVien": "Amy Poehler, Maya Hawke, Lewis Black, Phyllis Smith, Tony Hale, Liza Lapira, Ayo Edebiri, Adèle Exarchopoulos, Paul Walter Hauser,....",
            "QuocGia": "Hoa Kỳ",
            "TrailerUrl": "https://youtu.be/LEjhY15eCx0?si=CuSP-algD4HVWJd9",
            "ThoiLuong": 96,
            "NgayBatDauChieu": "2025-10-29T21:52:23.000Z",
            "NgayKetThucChieu": "2025-12-26T21:52:28.000Z",
            "DiemDanhGia": "7.5",
            "TrangThaiPhim": "DANGCHIEU",
            "CreatedAt": "2025-11-01T14:55:45.027Z",
            "UpdatedAt": "2025-11-01T14:55:45.027Z",
            "DeletedAt": null,
            "DanhGias": [
                {
                    "MaDanhGia": "67502c0f-46ce-414b-a7ec-678fbcd0c2c5",
                    "NoiDung": "Hay tuyệt vời <3",
                    "Diem": "2",
                    "MaPhim": "a623c63d-53ed-4438-8a43-965510f52016",
                    "CreatedAt": "2025-11-02T08:02:26.602Z",
                    "UpdatedAt": "2025-11-02T08:02:26.602Z",
                    "DeletedAt": null
                }
            ],
            "DinhDangs": [
                {
                    "DINHDANG": {
                        "MaDinhDang": "298d831e-e0c4-4904-b815-24bd718a9b8f",
                        "TenDinhDang": "2D",
                        "GiaVe": "50000",
                        "CreatedAt": "2025-11-01T14:57:03.089Z",
                        "UpdatedAt": "2025-11-01T14:57:03.089Z",
                        "DeletedAt": null
                    },
                    "GiaVe": "50000"
                },
                {
                    "DINHDANG": {
                        "MaDinhDang": "2ea7e036-6656-4fa5-82a1-9f937840df3e",
                        "TenDinhDang": "3D",
                        "GiaVe": "71000",
                        "CreatedAt": "2025-11-01T14:57:29.306Z",
                        "UpdatedAt": "2025-11-01T14:57:29.306Z",
                        "DeletedAt": null
                    },
                    "GiaVe": "71000"
                }
            ],
            "TheLoais": [
                {
                    "THELOAI": {
                        "MaTheLoai": "f6003de3-25d4-4704-a7ca-202c6b4af531",
                        "TenTheLoai": "Hoạt hình",
                        "CreatedAt": "2025-11-01T14:56:18.359Z",
                        "UpdatedAt": "2025-11-01T14:56:18.359Z",
                        "DeletedAt": null
                    }
                }
            ]
        }
    })
    async getById(@Param('id') id: string) {
        const film = await this.filmService.getFilmById(id);
        if (!film) throw new NotFoundException('Phim không tồn tại');
        return film;
    }
}
