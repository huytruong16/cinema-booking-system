import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateTransactionMethodDto } from './dto/update-transaction-method';
import { GetTransactionDto } from './dto/get-transaction.dto';
import { isUUID } from 'class-validator';
import { CreateRefundTransactionDto } from './dto/create-refund-transaction.dto';
import { JwtAuthGuard } from 'src/libs/common/guards/jwt-auth.guard';
import { UpdateRefundTransactionStatusDto } from './dto/update-refund-transaction-status.dto';
import { Public } from 'src/libs/common/decorators/public.decorator';
import { RolesGuard } from 'src/libs/common/guards/role.guard';
import { Roles } from 'src/libs/common/decorators/role.decorator';
import { RoleEnum } from 'src/libs/common/enums';

@Controller('transactions')
@ApiTags('Giao dịch')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy danh sách các giao dịch' })
  async getAllTransaction(@Req() req, @Query() filters: GetTransactionDto) {
    return await this.transactionService.getAllTransactions(
      req.user.id,
      req.user.vaitro,
      filters,
    );
  }

  @ApiExcludeEndpoint()
  @Post('payos/webhook')
  @Public()
  @ApiOperation({
    summary: 'Nhận Webhook từ PayOS để cập nhật trạng thái thanh toán',
  })
  async handlePayosWebhook(@Body() body: any) {
    return this.transactionService.updateTransactionStatus(body);
  }

  @Post('refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.NHANVIEN, RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Tạo giao dịch hoàn tiền cho danh sách yêu cầu hoàn vé',
  })
  async createRefundTransaction(@Body() body: CreateRefundTransactionDto) {
    return this.transactionService.createRefundTransaction(body);
  }

  @Patch('refund/status/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.NHANVIEN, RoleEnum.ADMIN)
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
    return this.transactionService.updateRefundTransactionStatus(
      transactionId,
      request,
    );
  }

  @Patch('/method/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.NHANVIEN)
  @ApiOperation({ summary: 'Cập nhật phương thức giao dịch' })
  @ApiParam({ name: 'id', description: 'Mã giao dịch', required: true })
  async updateTransactionMethod(
    @Param('id') transactionId: string,
    @Body() request: UpdateTransactionMethodDto,
  ) {
    if (!isUUID(transactionId, '4')) {
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    }
    return this.transactionService.updateTransactionMethod(
      transactionId,
      request,
    );
  }

  @Get('/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy thông tin giao dịch theo mã giao dịch' })
  @ApiParam({ name: 'id', description: 'Mã giao dịch', required: true })
  async getTransactionById(@Req() req, @Param('id') transactionId: string) {
    if (!isUUID(transactionId, '4')) {
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    }
    return this.transactionService.getTransactionById(
      req.user.id,
      req.user.vaitro,
      transactionId,
    );
  }
}
