import { BadRequestException, Body, Controller, Get, Param, Patch, Post, SetMetadata, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { MailService } from 'src/modules/mail/mail.service';
import { UpdateTransactionMethodDto } from './dto/update-transaction-method';
import { isUUID } from 'class-validator';
import { CreateRefundTransactionDto } from './dto/create-refund-transaction.dto';
import { JwtAuthGuard } from 'src/libs/common/guards/jwt-auth.guard';

@Controller('transactions')
@ApiTags('Giao dịch')
export class TransactionController {
    constructor(
        private readonly transactionService: TransactionService,
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

    @Post('refund')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Tạo giao dịch hoàn tiền cho danh sách yêu cầu hoàn vé' })
    async createRefundTransaction(
        @Body() body: CreateRefundTransactionDto,
    ) {
        return this.transactionService.createRefundTransaction(body);
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