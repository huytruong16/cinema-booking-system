import { Module } from '@nestjs/common';
import { RefundRequestController } from './refund-request.controller';
import { RefundRequestService } from './refund-request.service';

@Module({
    controllers: [RefundRequestController],
    providers: [RefundRequestService],
    exports: [RefundRequestService],
})
export class RefundRequestModule { }
