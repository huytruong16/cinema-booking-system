import { Module } from '@nestjs/common';
import { RefundRequestController } from './refund-request.controller';
import { RefundRequestService } from './refund-request.service';
import { MailService } from '../mail/mail.service';

@Module({
    controllers: [RefundRequestController],
    providers: [RefundRequestService, MailService],
    exports: [RefundRequestService],
})
export class RefundRequestModule { }
