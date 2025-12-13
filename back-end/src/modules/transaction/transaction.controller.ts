import { BadRequestException, Body, Controller, Get, Param, Patch, Post, SetMetadata } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { ApiExcludeEndpoint, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { MailService } from 'src/modules/mail/mail.service';
import { UpdateTransactionMethodDto } from './dto/update-transaction-method';
import { isUUID } from 'class-validator';

@Controller('transactions')
@ApiTags('Giao dịch')
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

    @Patch('/method/:id')
    @ApiOperation({ summary: 'Cập nhật phương thức giao dịch' })
    @ApiParam({ name: 'id', description: 'Mã giao dịch', required: true })
    async updateTransactionMethod(
        @Param('id') transactionId: string,
        @Body() request: UpdateTransactionMethodDto,
    ) {
        if (!isUUID(transactionId, '4')) {
            throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
        }
        return this.transactionService.updateTransactionMethod(transactionId, request);
    }
}