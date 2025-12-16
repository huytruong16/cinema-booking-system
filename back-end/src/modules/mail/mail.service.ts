import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import nodemailer from 'nodemailer';
import { join } from 'path';
import formatCurrency from 'src/libs/common/helpers/format-vn-currency';
import InvoiceMailDto from './dto/invoice-mail.dto';
import { RefundRequestStatusEnum } from 'src/libs/common/enums';


@Injectable()
export class MailService {
    private transporter;

    constructor(private readonly configService: ConfigService) {
        const smtpConfig = this.configService.get('smtp');
        this.transporter = nodemailer.createTransport({
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: false,
            auth: {
                user: smtpConfig.user,
                pass: smtpConfig.pass,
            },
        });
    }

    async sendOTPEmail(
        to: string,
        subject: string,
        otp: string,
        fullName: string,
        emailType: 'register' | 'forgot-password'
    ) {
        const smtpConfig = this.configService.get('smtp');

        const emailConfig = {
            'register': {
                template: 'email-verify-otp.hbs',
                title: 'Xác minh email',
                heading: 'Xác minh email',
                purpose: 'Mã OTP để xác minh tài khoản của bạn là',
                instruction: 'Mã OTP này dùng để xác nhận email khi đăng ký tài khoản mới.'
            },
            'forgot-password': {
                template: 'email-forgot-password-otp.hbs',
                title: 'Thay đổi mật khẩu',
                heading: 'Thay đổi mật khẩu',
                purpose: 'Mã OTP để xác minh tài khoản của bạn là',
                instruction: 'Mã OTP này dùng để thay đổi mật khẩu mới.'
            }
        };

        const config = emailConfig[emailType];

        const htmlTemplate = readFileSync(
            join(__dirname, '..', '..', '..', 'templates', 'email-otp.hbs'),
            'utf-8'
        );

        let htmlContent = htmlTemplate
            .replace('{{otp}}', otp)
            .replace('{{user_name}}', fullName)
            .replace('{{email_title}}', config.title)
            .replace('{{email_heading}}', config.heading)
            .replace('{{otp_purpose}}', config.purpose)
            .replace('{{instruction_text}}', config.instruction);

        await this.transporter.sendMail({
            from: `"Support" <${smtpConfig.from}>`,
            to,
            subject,
            html: htmlContent
        });
    }

    async sendInvoiceEmail(
        to: string,
        subject: string,
        invoiceData: InvoiceMailDto,
    ) {
        const smtpConfig = this.configService.get('smtp');

        const htmlTemplate = readFileSync(
            join(__dirname, '..', '..', '..', 'templates', 'email-invoice.hbs'),
            'utf-8'
        );

        const bookingCode = invoiceData.Transaction.GiaoDich.HoaDon.Code;
        const bookingDate = new Date(invoiceData.Transaction.GiaoDich.HoaDon.CreatedAt).toLocaleDateString('vi-VN');
        const totalAmount = new Intl.NumberFormat('vi-VN').format(Number(invoiceData.Transaction.GiaoDich.HoaDon.TongTien));

        const movieName = invoiceData.Showtime.PhienBanPhim.Phim.TenHienThi;
        const movieRating = invoiceData.Showtime.PhienBanPhim.Phim.NhanPhim.TenNhanPhim;
        const movieLanguage = invoiceData.Showtime.PhienBanPhim.Phim.NgonNgu.TenNgonNgu;

        let displayMovieName = movieName;
        if (movieRating && movieLanguage) {
            displayMovieName += ` (${movieRating} - ${movieLanguage})`;
        } else if (movieRating) {
            displayMovieName += ` (${movieRating})`;
        } else if (movieLanguage) {
            displayMovieName += ` (${movieLanguage})`;
        }

        const roomName = invoiceData.Showtime.PhongChieu.TenPhongChieu;

        const showTime = new Date(invoiceData.Showtime.ThoiGianBatDau).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const showDate = new Date(invoiceData.Showtime.ThoiGianBatDau).toLocaleDateString('vi-VN');

        const invoice = invoiceData.Transaction.GiaoDich.HoaDon;

        let rowsHtml = '';
        let stt = 1;
        let calculatedTotal = 0;

        if (invoice.Ves && invoice.Ves.length) {
            invoice.Ves.forEach((ve: any) => {
                const price = Number(ve.GiaVe || 0);
                const seatGhe = ve.GheSuatChieu?.GhePhongChieu?.GheLoaiGhe?.Ghe;
                const seatCode = seatGhe ? `${seatGhe.Hang}${seatGhe.Cot}` : '??';
                const lineTotal = price;
                calculatedTotal += lineTotal;

                rowsHtml += `
                    <tr>
                        <td class="text-center">${stt++}</td>
                        <td class="text-left">Ghế ${seatCode}</td>
                        <td class="text-center">1</td>
                        <td class="text-right">${formatCurrency(price)}</td>
                        <td class="text-right">${formatCurrency(lineTotal)}</td>
                    </tr>
                `;
            });
        }

        if (invoice.HoaDonCombos) {
            invoice.HoaDonCombos.forEach((hdc: any) => {
                const price = Number(hdc.DonGia);
                const total = hdc.SoLuong * price;
                calculatedTotal += total;

                rowsHtml += `
                    <tr>
                        <td class="text-center">${stt++}</td>
                        <td>${hdc.Combo.TenCombo}</td>
                        <td class="text-center">${hdc.SoLuong}</td>
                        <td class="text-right">${formatCurrency(price)}</td>
                        <td class="text-right">${formatCurrency(total)}</td>
                    </tr>
                `;
            });
        }

        const finalTotal = Number(invoice.TongTien);

        rowsHtml += `
                <tr>
                    <td colspan="4" class="text-right" style="font-weight: 600;">Tổng tiền</td>
                    <td class="text-right">${formatCurrency(finalTotal)}</td>
                </tr>
            `;

        let htmlContent = htmlTemplate
            .replace('{{movie_name}}', displayMovieName)
            .replace('{{cinema_room}}', roomName)
            .replace('{{show_time}}', showTime)
            .replace('{{show_date}}', showDate)
            .replace('{{booking_code}}', bookingCode)
            .replace('{{booking_date}}', bookingDate)
            .replace('{{total_amount}}', totalAmount)
            .replace('{{{invoice_items_rows}}}', rowsHtml);

        await this.transporter.sendMail({
            from: `"Movix" <${smtpConfig.from}>`,
            to,
            subject,
            html: htmlContent
        });
    }

    async sendRefundDecisionEmail(
        to: string,
        data: {
            TicketCode: string;
            BookingCode: string;
            MovieName: string;
            CinemaRoom: string;
            SeatCode: string;
            ShowTime: string;
            RefundAmount: string;
            BankAccount: string;
            BankName: string;
            AccountHolder: string;
            RefundDate: string;
        },
        status: RefundRequestStatusEnum
    ) {
        const smtpConfig = this.configService.get('smtp');

        const htmlTemplate = readFileSync(
            join(__dirname, '..', '..', '..', 'templates', 'email-refund-decision.hbs'),
            'utf-8'
        );

        const isRefunded = status === RefundRequestStatusEnum.DAHOAN;
        const subject = isRefunded
            ? `[Movix] Xác nhận hoàn tiền thành công - Mã vé ${data.TicketCode}`
            : `[Movix] Thông báo hủy yêu cầu hoàn vé - Mã vé ${data.TicketCode}`;

        const title = isRefunded ? 'YÊU CẦU HOÀN VÉ ĐÃ ĐƯỢC CHẤP NHẬN' : 'YÊU CẦU HOÀN VÉ BỊ TỪ CHỐI';

        let transactionDetailsHtml = '';
        if (isRefunded) {
            transactionDetailsHtml = `
                <div style="margin-top: 20px; border-top: 1px dashed #ccc; padding-top: 15px;">
                    <h3 style="color: #28a745; margin-bottom: 10px;">Chi tiết giao dịch hoàn tiền</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 5px 0; color: #666;">Số tiền hoàn:</td>
                            <td style="padding: 5px 0; font-weight: bold; text-align: right;">${data.RefundAmount}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #666;">Thời gian hoàn:</td>
                            <td style="padding: 5px 0; text-align: right;">${data.RefundDate}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #666;">Ngân hàng thụ hưởng:</td>
                            <td style="padding: 5px 0; text-align: right;">${data.BankName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #666;">Số tài khoản:</td>
                            <td style="padding: 5px 0; text-align: right;">${data.BankAccount}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #666;">Chủ tài khoản:</td>
                            <td style="padding: 5px 0; text-align: right; text-transform: uppercase;">${data.AccountHolder}</td>
                        </tr>
                    </table>
                    <p style="font-size: 13px; color: #888; margin-top: 10px; font-style: italic;">
                        *Lưu ý: Tiền sẽ về tài khoản của bạn trong vòng 1-3 ngày làm việc tùy thuộc vào ngân hàng thụ hưởng.
                    </p>
                </div>
            `;
        }

        let htmlContent = htmlTemplate
            .replace('{{title}}', title)
            .replace('{{booking_code}}', data.BookingCode)
            .replace('{{ticket_code}}', data.TicketCode)
            .replace('{{movie_name}}', data.MovieName)
            .replace('{{show_time}}', data.ShowTime)
            .replace('{{cinema_room}}', data.CinemaRoom)
            .replace('{{seat_code}}', data.SeatCode)
            .replace('{{{transaction_details}}}', transactionDetailsHtml);

        await this.transporter.sendMail({
            from: `"Movix Support" <${smtpConfig.from}>`,
            to,
            subject,
            html: htmlContent
        });
    }
}
