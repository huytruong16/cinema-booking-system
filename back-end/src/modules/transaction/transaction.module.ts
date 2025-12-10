import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { MailService } from 'src/modules/mail/mail.service';
import { PayosService } from 'src/libs/common/services/payos.service';

@Module({
    imports: [ConfigModule],
    controllers: [TransactionController],
    providers: [TransactionService, MailService, PayosService],
    exports: [TransactionService],
})
export class TransactionModule { }