import { BadRequestException, Body, Controller, Get, Param, Patch, Post, SetMetadata, UseGuards, Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { UpdateTransactionMethodDto } from './dto/update-transaction-method';
import { GetTransactionDto } from './dto/get-transaction.dto';
import { isUUID } from 'class-validator';
import { CreateRefundTransactionDto } from './dto/create-refund-transaction.dto';
import { JwtAuthGuard } from 'src/libs/common/guards/jwt-auth.guard';
import { UpdateRefundTransactionStatusDto } from './dto/update-refund-transaction-status.dto';

@Controller('transactions')
@ApiTags('Giao dịch')
export class TransactionController {
    constructor(
        private readonly transactionService: TransactionService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách các giao dịch' })
    async getAllTransaction(@Query() filters: GetTransactionDto) {
        return await this.transactionService.getAllTransactions(filters);
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

    @Patch('refund/status/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cập nhật trạng thái giao dịch hoàn tiền' })
    @ApiParam({ name: 'id', description: 'Mã giao dịch', required: true })
    async updateTransactionStatus(
        @Param('id') transactionId: string,
        @Body() request: UpdateRefundTransactionStatusDto,
    ) {
        if (!isUUID(transactionId, '4')) {
            throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
        }
        return this.transactionService.updateRefundTransactionStatus(transactionId, request);
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

    @Get('/:id')
    @ApiOperation({ summary: 'Lấy thông tin giao dịch theo mã giao dịch' })
    @ApiParam({ name: 'id', description: 'Mã giao dịch', required: true })
    async getTransactionById(
        @Param('id') transactionId: string,
    ) {
        if (!isUUID(transactionId, '4')) {
            throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
        }
        return this.transactionService.getTransactionById(transactionId);
    }
}