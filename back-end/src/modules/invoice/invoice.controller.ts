import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Query,
  Res,
  Req,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import { CreateInvoiceDto } from './dtos/create-invoice.dto';
import { GetInvoiceDto } from './dtos/get-invoice.dto';
import { JwtAuthGuard } from 'src/libs/common/guards/jwt-auth.guard';
import express from 'express';
import { Public } from 'src/libs/common/decorators/public.decorator';
import { RolesGuard } from 'src/libs/common/guards/role.guard';
import { Roles } from 'src/libs/common/decorators/role.decorator';
import { RoleEnum } from 'src/libs/common/enums';

@ApiTags('Hóa đơn')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách các hóa đơn' })
  async getAllInvoices(@Req() req, @Query() filters: GetInvoiceDto) {
    return this.invoiceService.getAllInvoices(
      req.user.id,
      req.user.vaitro,
      filters,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết hóa đơn theo mã' })
  @ApiParam({ name: 'id', description: 'Mã hóa đơn', required: true })
  async getInvoiceById(@Req() req, @Param('id') id: string) {
    if (!isUUID(id, '4'))
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    return this.invoiceService.getInvoiceById(req.user.id, req.user.vaitro, id);
  }

  @Post()
  @Public()
  @ApiOperation({ summary: 'Tạo hóa đơn mới' })
  async createInvoice(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoiceService.createInvoice(createInvoiceDto);
  }

  @Get(':code/pdf')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.NHANVIEN)
  @ApiOperation({ summary: 'In hóa đơn PDF' })
  @ApiParam({ name: 'code', description: 'Code hóa đơn', required: true })
  async printInvoice(
    @Param('code') code: string,
    @Res() res: express.Response,
  ) {
    const buffer = await this.invoiceService.printInvoice(code);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=invoice-${code}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Get('/:code/ticket/pdf')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.NHANVIEN)
  @ApiOperation({ summary: 'Kiểm tra in các vé trong hóa đơn' })
  @ApiParam({ name: 'code', description: 'Mã hóa đơn', required: true })
  async checkInTicket(
    @Param('code') code: string,
    @Res() res: express.Response,
  ) {
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
