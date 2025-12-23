import { ApiProperty } from '@nestjs/swagger';
import { ScreeningRoomStatusEnum } from '../../../libs/common/enums/screening-room-status.enum';

export class RoomInfo {
  @ApiProperty({ description: 'Mã phòng chiếu' })
  MaPhongChieu: string;

  @ApiProperty({ description: 'Tên phòng chiếu' })
  TenPhongChieu: string;
}

export class ShowtimeInfo {
  @ApiProperty({ description: 'Mã suất chiếu' })
  MaSuatChieu: string;

  @ApiProperty({ description: 'Mã phim' })
  MaPhim: string;

  @ApiProperty({ description: 'Tên phim' })
  TenPhim: string;

  @ApiProperty({ description: 'Thời gian bắt đầu suất chiếu' })
  ThoiGianBatDau: string;

  @ApiProperty({ description: 'Thời gian kết thúc suất chiếu' })
  ThoiGianKetThuc: string;
}

export class UpcomingShowtimeInfo extends ShowtimeInfo {
  @ApiProperty({ description: 'Số phút còn lại' })
  SoPhutConLai: number;
}

export class RoomStatusDto {
  @ApiProperty({ description: 'Thông tin phòng chiếu', type: RoomInfo })
  PhongChieu: RoomInfo;

  @ApiProperty({
    description: 'Trạng thái phòng: Đang chiếu, Trống, Sắp chiếu',
    enum: ScreeningRoomStatusEnum,
  })
  TrangThai: ScreeningRoomStatusEnum;

  @ApiProperty({ description: 'Số ghế đã đặt' })
  GheDaDat?: number;

  @ApiProperty({ description: 'Tổng số ghế' })
  TongGhe?: number;

  @ApiProperty({
    description: 'Suất chiếu đang diễn ra',
    type: ShowtimeInfo,
    required: false,
  })
  SuatChieuHienTai?: ShowtimeInfo;

  @ApiProperty({
    description: 'Suất chiếu sắp tới',
    type: UpcomingShowtimeInfo,
    required: false,
  })
  SuatChieuTiepTheo?: UpcomingShowtimeInfo;
}
