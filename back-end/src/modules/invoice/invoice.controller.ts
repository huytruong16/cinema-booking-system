import { BadRequestException, Body, Controller, Get, Param, Post, UseGuards, Query, SetMetadata, Res } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import { CreateInvoiceDto } from './dtos/create-invoice.dto';
import { GetInvoiceDto } from './dtos/get-invoice.dto';
import { JwtAuthGuard } from 'src/libs/common/guards/jwt-auth.guard';
import express from 'express';

@ApiTags('Hóa đơn')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) { }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách các hóa đơn' })
  async getAllInvoices(@Query() filters: GetInvoiceDto) {
    return this.invoiceService.getAllInvoices(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết hóa đơn theo mã' })
  @ApiParam({ name: 'id', description: 'Mã hóa đơn', required: true })
  async getInvoiceById(@Param('id') id: string) {
    if (!isUUID(id, '4')) throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    return this.invoiceService.getInvoiceById(id);
  }

  @Post()
  @SetMetadata('isPublic', true)
  @ApiOperation({ summary: 'Tạo hóa đơn mới' })
  async createInvoice(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoiceService.createInvoice(createInvoiceDto);
  }

  @Get('/:code/ticket/pdf')
  @SetMetadata('isPublic', true)
  @ApiOperation({ summary: 'Kiểm tra in hóa đơn' })
  @ApiParam({ name: 'code', description: 'Mã hóa đơn', required: true })
  async checkInTicket(@Param('code') code: string, @Res() res: express.Response) {
    const buffer = await this.invoiceService.checkIn(code);

    if (Buffer.isBuffer(buffer)) {
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=tickets-${code}.pdf`,
        'Content-Length': buffer.length,
      });
      res.end(buffer);
    } else {
      res.json(buffer);
    }
  }
}
