import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ScreeningRoomService } from './screening-room.service';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
} from '@nestjs/swagger';

@ApiTags('Phòng chiếu')
@Controller('screening-rooms')
export class ScreeningRoomController {
    constructor(private readonly screeningRoomService: ScreeningRoomService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách các phòng chiếu' })
    @ApiResponse({
        status: 200,
        example: [{
            "MaPhongChieu": "375afd67-6c14-46ea-a209-3ecb895d2780",
            "TenPhongChieu": "Phòng 1",
            "SoDoGhe": {
                "A": [
                    "01",
                    "02",
                    "03",
                    "04",
                    "",
                    "",
                    "05",
                    "06",
                    "07",
                    "",
                    "08",
                    "",
                    "",
                    "09",
                    "10"
                ],
                "B": [
                    "01",
                    "02",
                    "03",
                    "04",
                    "",
                    "",
                    "05",
                    "06",
                    "07",
                    "08",
                    "",
                    "09",
                    "10",
                    "",
                    ""
                ],
                "C": [
                    "01",
                    "02",
                    "03",
                    "",
                    "",
                    "04",
                    "05",
                    "06",
                    "07",
                    "",
                    "08",
                    "09",
                    "10",
                    "",
                    ""
                ],
                "D": [
                    "01",
                    "02",
                    "03",
                    "04",
                    "",
                    "",
                    "",
                    "05",
                    "06",
                    "07",
                    "",
                    "08",
                    "09",
                    "10",
                    ""
                ],
                "E": [
                    "01",
                    "02",
                    "03",
                    "04",
                    "",
                    "",
                    "05",
                    "06",
                    "07",
                    "08",
                    "",
                    "09",
                    "10",
                    "",
                    ""
                ],
                "F": [
                    "01",
                    "02",
                    "03",
                    "04",
                    "",
                    "",
                    "05",
                    "06",
                    "07",
                    "08",
                    "",
                    "09",
                    "10",
                    "",
                    ""
                ],
                "G": [
                    "01",
                    "01",
                    "",
                    "",
                    "02",
                    "02",
                    "",
                    "",
                    "03",
                    "03",
                    "",
                    "",
                    "",
                    "04",
                    "04"
                ]
            },
            "GhePhongChieu": [
                {
                    "MaGhePhongChieu": "e46ed8bd-aa02-4454-9dc8-d57736edee00",
                    "GHE_LOAIGHE": {
                        "MaGheLoaiGhe": "3517a776-b082-451c-9762-035e18e9cc08",
                        "GHE": {
                            "MaGhe": "43779c8e-984e-41bf-b81a-14df77fba113",
                            "Hang": "A",
                            "Cot": "01"
                        },
                        "LOAIGHE": {
                            "MaLoaiGhe": "b51a7132-b675-4ddc-9af7-ca6c49939d14",
                            "LoaiGhe": "VIP",
                            "HeSoGiaGhe": 1.5
                        }
                    }
                },
                {
                    "MaGhePhongChieu": "54bec7e6-d80e-4a2a-8e36-7733ea30b6e0",
                    "GHE_LOAIGHE": {
                        "MaGheLoaiGhe": "463a7059-c6d7-4d26-8c66-7da2d8b62190",
                        "GHE": {
                            "MaGhe": "691c2ed8-be5a-45f3-b653-e93430d997b1",
                            "Hang": "A",
                            "Cot": "02"
                        },
                        "LOAIGHE": {
                            "MaLoaiGhe": "b51a7132-b675-4ddc-9af7-ca6c49939d14",
                            "LoaiGhe": "VIP",
                            "HeSoGiaGhe": 1.5
                        }
                    }
                },
                {
                    "MaGhePhongChieu": "e737b1d3-4a08-4eb2-abd4-9142fd565833",
                    "GHE_LOAIGHE": {
                        "MaGheLoaiGhe": "52378837-3e93-4444-8b82-08364f6e0915",
                        "GHE": {
                            "MaGhe": "79ffaf03-7c0b-4d1a-bc43-eab16d3452dd",
                            "Hang": "A",
                            "Cot": "03"
                        },
                        "LOAIGHE": {
                            "MaLoaiGhe": "b51a7132-b675-4ddc-9af7-ca6c49939d14",
                            "LoaiGhe": "VIP",
                            "HeSoGiaGhe": 1.5
                        }
                    }
                },
                "..."
            ],
            "CreatedAt": "2025-11-18T03:35:58.665Z",
            "UpdatedAt": "2025-11-18T03:35:58.665Z",
            "DeletedAt": null
        },
        ]
    })
    async getAllScreeningRooms() {
        return this.screeningRoomService.getAllScreeningRooms();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết phòng chiếu theo mã' })
    @ApiParam({ name: 'id', description: 'Mã phòng chiếu', required: true })
    @ApiResponse({
        status: 200,
        example: {
            "MaPhongChieu": "375afd67-6c14-46ea-a209-3ecb895d2780",
            "TenPhongChieu": "Phòng 1",
            "SoDoGhe": {
                "A": [
                    "01",
                    "02",
                    "03",
                    "04",
                    "",
                    "",
                    "05",
                    "06",
                    "07",
                    "",
                    "08",
                    "",
                    "",
                    "09",
                    "10"
                ],
                "B": [
                    "01",
                    "02",
                    "03",
                    "04",
                    "",
                    "",
                    "05",
                    "06",
                    "07",
                    "08",
                    "",
                    "09",
                    "10",
                    "",
                    ""
                ],
                "C": [
                    "01",
                    "02",
                    "03",
                    "",
                    "",
                    "04",
                    "05",
                    "06",
                    "07",
                    "",
                    "08",
                    "09",
                    "10",
                    "",
                    ""
                ],
                "D": [
                    "01",
                    "02",
                    "03",
                    "04",
                    "",
                    "",
                    "",
                    "05",
                    "06",
                    "07",
                    "",
                    "08",
                    "09",
                    "10",
                    ""
                ],
                "E": [
                    "01",
                    "02",
                    "03",
                    "04",
                    "",
                    "",
                    "05",
                    "06",
                    "07",
                    "08",
                    "",
                    "09",
                    "10",
                    "",
                    ""
                ],
                "F": [
                    "01",
                    "02",
                    "03",
                    "04",
                    "",
                    "",
                    "05",
                    "06",
                    "07",
                    "08",
                    "",
                    "09",
                    "10",
                    "",
                    ""
                ],
                "G": [
                    "01",
                    "01",
                    "",
                    "",
                    "02",
                    "02",
                    "",
                    "",
                    "03",
                    "03",
                    "",
                    "",
                    "",
                    "04",
                    "04"
                ]
            },
            "CreatedAt": "2025-11-18T03:35:58.665Z",
            "UpdatedAt": "2025-11-18T03:35:58.665Z",
            "DeletedAt": null,
            "GhePhongChieu": [
                {
                    "MaGhePhongChieu": "e46ed8bd-aa02-4454-9dc8-d57736edee00",
                    "GHE_LOAIGHE": {
                        "MaGheLoaiGhe": "3517a776-b082-451c-9762-035e18e9cc08",
                        "GHE": {
                            "MaGhe": "43779c8e-984e-41bf-b81a-14df77fba113",
                            "Hang": "A",
                            "Cot": "01"
                        },
                        "LOAIGHE": {
                            "MaLoaiGhe": "b51a7132-b675-4ddc-9af7-ca6c49939d14",
                            "LoaiGhe": "VIP",
                            "HeSoGiaGhe": 1.5
                        }
                    }
                },
                {
                    "MaGhePhongChieu": "54bec7e6-d80e-4a2a-8e36-7733ea30b6e0",
                    "GHE_LOAIGHE": {
                        "MaGheLoaiGhe": "463a7059-c6d7-4d26-8c66-7da2d8b62190",
                        "GHE": {
                            "MaGhe": "691c2ed8-be5a-45f3-b653-e93430d997b1",
                            "Hang": "A",
                            "Cot": "02"
                        },
                        "LOAIGHE": {
                            "MaLoaiGhe": "b51a7132-b675-4ddc-9af7-ca6c49939d14",
                            "LoaiGhe": "VIP",
                            "HeSoGiaGhe": 1.5
                        }
                    }
                },
                {
                    "MaGhePhongChieu": "e737b1d3-4a08-4eb2-abd4-9142fd565833",
                    "GHE_LOAIGHE": {
                        "MaGheLoaiGhe": "52378837-3e93-4444-8b82-08364f6e0915",
                        "GHE": {
                            "MaGhe": "79ffaf03-7c0b-4d1a-bc43-eab16d3452dd",
                            "Hang": "A",
                            "Cot": "03"
                        },
                        "LOAIGHE": {
                            "MaLoaiGhe": "b51a7132-b675-4ddc-9af7-ca6c49939d14",
                            "LoaiGhe": "VIP",
                            "HeSoGiaGhe": 1.5
                        }
                    }
                },
                {
                    "MaGhePhongChieu": "07bb3fc6-c7c8-4d64-ab33-b6ae82d6c705",
                    "GHE_LOAIGHE": {
                        "MaGheLoaiGhe": "870f331f-b663-4aa2-8f49-76236237584a",
                        "GHE": {
                            "MaGhe": "0474f6b9-6509-419a-b302-036ae5ad711c",
                            "Hang": "A",
                            "Cot": "04"
                        },
                        "LOAIGHE": {
                            "MaLoaiGhe": "b51a7132-b675-4ddc-9af7-ca6c49939d14",
                            "LoaiGhe": "VIP",
                            "HeSoGiaGhe": 1.5
                        }
                    }
                },
                "..."
            ]
        }
    })
    async getScreeningRoomById(@Param('id') id: string) {
        const room = await this.screeningRoomService.getScreeningRoomById(id);
        if (!room) throw new NotFoundException('Phòng chiếu không tồn tại');
        return room;
    }
}
