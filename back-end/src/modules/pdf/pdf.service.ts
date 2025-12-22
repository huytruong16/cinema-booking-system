import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument from 'pdfkit';
import * as path from 'path';
import * as fs from 'fs';
import * as QRCode from 'qrcode';

@Injectable()
export class PdfService {
    constructor(private prisma: PrismaService) { }

    async generateTicketsPdf(ticketCodes: string[]): Promise<Buffer> {
        const tickets = await this.prisma.vE.findMany({
            where: { Code: { in: ticketCodes } },
            include: {
                GheSuatChieu: {
                    include: {
                        SuatChieu: {
                            include: {
                                PhienBanPhim: {
                                    include: {
                                        Phim: true,
                                        DinhDang: true,
                                        NgonNgu: true,
                                    },
                                },
                                PhongChieu: true,
                            },
                        },
                        GhePhongChieu: {
                            include: {
                                GheLoaiGhe: {
                                    include: {
                                        Ghe: true,
                                        LoaiGhe: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        const ticketsWithQR = await Promise.all(tickets.map(async (ticket) => {
            try {
                const qrBuffer = await QRCode.toBuffer(ticket.Code, {
                    errorCorrectionLevel: 'H',
                    width: 150,
                });
                return { ...ticket, qrBuffer };
            } catch (e) {
                return { ...ticket, qrBuffer: null };
            }
        }));

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ size: [600, 250], margin: 0, autoFirstPage: false });
            const buffers: Buffer[] = [];

            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', (err) => reject(err));

            this.registerFonts(doc);

            for (const ticket of ticketsWithQR) {
                doc.addPage({ size: [600, 250], margin: 0 });
                this.drawTicket(doc, ticket);
            }

            doc.end();
        });
    }

    private registerFonts(doc: PDFKit.PDFDocument) {
        const fontPathRegular = path.join(__dirname, '..', '..', '..', 'assets', 'fonts', 'Arial.ttf');
        const fontPathBold = path.join(__dirname, '..', '..', '..', 'assets', 'fonts', 'Arial-Bold.ttf');
        doc.registerFont('Arial', fontPathRegular);
        doc.registerFont('Arial-Bold', fontPathBold);
    }

    private drawTicket(doc: PDFKit.PDFDocument, ticket: any) {
        doc.font('Arial');
        doc.rect(0, 0, 600, 250).fill('#ffffff');
        doc.rect(10, 10, 580, 230).strokeColor('#333').lineWidth(2).stroke();

        const logoPath = path.join(__dirname, '..', '..', '..', 'assets', 'images', 'logo.png');
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 30, 30, { width: 80 });
        }
        doc.fillColor('#000');
        doc.fontSize(10).font('Arial-Bold').text('MOVIX CINEMA', 20, 120, { width: 100, align: 'center' });
        doc.fontSize(8).font('Arial').text('123 Đường ABC, TP.HCM', 20, 140, { width: 100, align: 'center' });

        doc.moveTo(140, 20).lineTo(140, 230).dash(5, { space: 5 }).stroke();

        let currentY = 30;
        const contentX = 160;
        const contentWidth = 280;

        const showtime = ticket.GheSuatChieu.SuatChieu;
        const movie = showtime.PhienBanPhim.Phim;
        const mvName = movie.TenHienThi.toUpperCase() + ' (' + showtime.PhienBanPhim.NgonNgu?.TenNgonNgu + ', ' + showtime.PhienBanPhim.DinhDang?.TenDinhDang + ')';
        const room = showtime.PhongChieu;
        const seat = ticket.GheSuatChieu.GhePhongChieu.GheLoaiGhe.Ghe;
        const seatName = `${seat.Hang}${seat.Cot}`;

        doc.font('Arial-Bold');
        doc.fontSize(14);

        const titleHeight = doc.heightOfString(mvName, { width: contentWidth });
        doc.text(mvName, contentX, currentY, { width: contentWidth });
        currentY += titleHeight + 10;

        doc.fontSize(10).font('Arial');
        doc.text(`Thể loại: Phim Chiếu Rạp`, contentX, currentY);
        currentY += 15;
        doc.text(`Thời lượng: ${movie.ThoiLuong} phút`, contentX, currentY);

        currentY += 25;

        const col1X = 160;
        const col2X = 300;
        const row1Y = currentY;
        const row2Y = currentY + 35;

        doc.font('Arial-Bold').fontSize(10).text('NGÀY CHIẾU', col1X, row1Y);
        doc.font('Arial').fontSize(12).text(showtime.ThoiGianBatDau.toLocaleDateString('vi-VN'), col1X, row1Y + 15);

        doc.font('Arial-Bold').fontSize(10).text('GIỜ CHIẾU', col2X, row1Y);
        doc.font('Arial').fontSize(12).text(showtime.ThoiGianBatDau.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }), col2X, row1Y + 15);

        doc.font('Arial-Bold').fontSize(10).text('RẠP', col1X, row2Y);
        doc.font('Arial').fontSize(12).text(room.TenPhongChieu, col1X, row2Y + 15);

        doc.font('Arial-Bold').fontSize(10).text('GHẾ', col2X, row2Y);
        doc.font('Arial').fontSize(16).fillColor('#e74c3c').text(seatName, col2X, row2Y + 12);

        doc.fillColor('#000');
        doc.moveTo(450, 20).lineTo(450, 230).dash(5, { space: 5 }).stroke();

        doc.font('Arial-Bold').fontSize(12).text('GIÁ VÉ', 470, 30);
        doc.fontSize(16).text(`${Number(ticket.GiaVe).toLocaleString('vi-VN')} đ`, 470, 50);

        doc.fontSize(10).text('MÃ VÉ', 470, 100);
        doc.fontSize(12).text(ticket.Code, 470, 120);

        if (ticket.qrBuffer) {
            doc.image(ticket.qrBuffer, 470, 145, { width: 80, height: 80 });
        } else {
            doc.rect(470, 150, 100, 40).fill('#000');
            doc.fillColor('#fff').fontSize(10).text(ticket.Code, 470, 165, { width: 100, align: 'center' });
        }
    }
}
