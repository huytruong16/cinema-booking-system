import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CursorUtils } from 'src/libs/common/utils/pagination.util';
import { GetTicketsDto } from './dtos/get-tickets.dto';
import { PdfService } from '../pdf/pdf.service';
import { RoleEnum, TicketStatusEnum } from 'src/libs/common/enums';

const ticketIncludes = {
  GheSuatChieu: {
    include: {
      GhePhongChieu: {
        include: {
          GheLoaiGhe: {
            include: {
              Ghe: true,
              LoaiGhe: true,
            },
          },
          PhongChieu: true,
        },
      },
      SuatChieu: {
        include: {
          PhienBanPhim: {
            include: {
              Phim: {
                include: {
                  PhimTheLoais: {
                    include: {
                      TheLoai: true,
                    },
                  },
                  NhanPhim: true,
                },
              },
              DinhDang: true,
              NgonNgu: true,
            },
          },
        },
      },
    },
  },
};
@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
  ) {}

  async getTickets(userId: string, role: string, filters?: GetTicketsDto) {
    const [data, pagination] = await this.prisma.xprisma.vE
      .paginate({
        where: {
          ...(role === RoleEnum.KHACHHANG && {
            HoaDon: {
              KhachHang: { NguoiDungPhanMem: { MaNguoiDung: userId } },
            },
          }),
          DeletedAt: null,
        },
        orderBy: [{ CreatedAt: 'desc' }, { MaVe: 'desc' }],
        include: ticketIncludes,
      })
      .withCursor(CursorUtils.getPrismaOptions(filters ?? {}, 'MaVe'));

    return { data, pagination };
  }

  async getTicketByCode(code: string) {
    return await this.prisma.vE.findUnique({
      where: {
        Code: code,
        DeletedAt: null,
      },
      include: ticketIncludes,
    });
  }

  async checkinTicketByCode(code: string) {
    const ticket = await this.prisma.vE.findUnique({
      where: { Code: code, DeletedAt: null },
    });

    if (!ticket) throw new NotFoundException('Vé không tồn tại');

    if (ticket.TrangThaiVe === TicketStatusEnum.DASUDUNG)
      throw new BadRequestException('Vé đã được sử dụng');

    if (ticket.TrangThaiVe === TicketStatusEnum.DAHOAN)
      throw new BadRequestException('Vé đã được hoàn');

    if (
      ticket.TrangThaiVe === TicketStatusEnum.CHOHOANTIEN ||
      ticket.TrangThaiVe === TicketStatusEnum.CHUAHOANTIEN
    )
      throw new BadRequestException('Vé đang trong quá trình hoàn tiền');

    if (ticket.TrangThaiVe === TicketStatusEnum.DAHETHAN)
      throw new BadRequestException('Vé đã hết hạn');

    await this.prisma.vE.update({
      where: { MaVe: ticket.MaVe },
      data: { TrangThaiVe: TicketStatusEnum.DASUDUNG },
      include: ticketIncludes,
    });

    return { message: 'Checkin thành công' };
  }

  async getTicketById(userId: string, role: string, id: string) {
    return await this.prisma.vE.findUnique({
      where: {
        ...(role === RoleEnum.KHACHHANG && {
          HoaDon: { KhachHang: { NguoiDungPhanMem: { MaNguoiDung: userId } } },
        }),
        MaVe: id,
        DeletedAt: null,
      },
      include: ticketIncludes,
    });
  }

  async updateTicketStatus(id: string, status: TicketStatusEnum) {
    return this.prisma.vE.update({
      where: { MaVe: id },
      data: { TrangThaiVe: status },
    });
  }

  async generateTicketsPdf(ticketCodes: string[]) {
    const codes: string[] = [];
    for (const code of ticketCodes) {
      const ticket = await this.getTicketByCode(code);

      if (ticket && ticket.TrangThaiVe === TicketStatusEnum.CHUASUDUNG) {
        codes.push(code);
      }
    }

    if (codes.length === 0) {
      throw new NotFoundException('Không có vé nào để in');
    }

    return this.pdfService.generateTicketsPdf(codes);
  }
}
