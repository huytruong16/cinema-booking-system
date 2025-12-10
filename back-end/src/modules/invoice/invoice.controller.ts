import { BadRequestException, Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import { CreateInvoiceDto } from './dtos/create-invoice.dto';
import { JwtAuthGuard } from 'src/libs/common/guards/jwt-auth.guard';

@ApiTags('Hóa đơn')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) { }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách các hóa đơn' })
  async getAllInvoices() {
    return this.invoiceService.getAllInvoices();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết hóa đơn theo mã' })
  @ApiParam({ name: 'id', description: 'Mã hóa đơn', required: true })
  async getInvoiceById(@Param('id') id: string) {
    if (!isUUID(id, '4')) throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    return this.invoiceService.getInvoiceById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo hóa đơn mới' })
  async createInvoice(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoiceService.createInvoice(createInvoiceDto);
  }
}
