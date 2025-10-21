import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

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

    async sendMail(to: string, subject: string, text: string) {
        const smtpConfig = this.configService.get('smtp');
        await this.transporter.sendMail({
            from: `"Support" <${smtpConfig.from}>`,
            to,
            subject,
            text,
        });
    }
}
