import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { isUUID } from 'class-validator';

@ApiTags('Hóa đơn')
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
}
