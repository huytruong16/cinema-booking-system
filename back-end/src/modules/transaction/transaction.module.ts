import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { MailService } from 'src/modules/mail/mail.service';
import { PayosService } from 'src/libs/common/services/payos.service';
import { TransactionCronService } from './transaction.cron.service';
import { RefundRequestService } from '../refund-request/refund-request.service';

@Module({
    imports: [ConfigModule],
    controllers: [TransactionController],
    providers: [TransactionService, MailService, PayosService, TransactionCronService, RefundRequestService],
    exports: [TransactionService],
})
export class TransactionModule { }