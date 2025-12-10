import { Body, Controller, Get, Post, SetMetadata } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { ApiExcludeEndpoint, ApiOperation } from '@nestjs/swagger';
import { MailService } from 'src/modules/mail/mail.service';
import InvoiceMailDto from 'src/modules/mail/dto/invoice-mail.dto';

@Controller('transactions')
export class TransactionController {
    constructor(
        private readonly transactionService: TransactionService,
        private readonly mailService: MailService
    ) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách các giao dịch' })
    async getAllTransaction() {
        return await this.transactionService.getAllTransactions();
    }

    @ApiExcludeEndpoint()
    @Post('payos/webhook')
    @SetMetadata('isPublic', true)
    @ApiOperation({ summary: 'Nhận Webhook từ PayOS để cập nhật trạng thái thanh toán' })
    async handlePayosWebhook(@Body() body: any) {
        return this.transactionService.updateTransactionStatus(body);
    }
}