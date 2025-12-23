import {
  Controller,
  Get,
  NotFoundException,
  Param,
  BadRequestException,
  Query,
  Res,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { GetTicketsDto } from './dtos/get-tickets.dto';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import express from 'express';

@ApiTags('Vé')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách các vé' })
  async findAll(@Query() filters: GetTicketsDto) {
    return await this.ticketsService.getTickets(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết vé theo mã' })
  @ApiParam({ name: 'id', description: 'Mã vé', required: true })
  async findOne(@Param('id') id: string) {
    if (!isUUID(id, '4'))
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    const ticket = await this.ticketsService.getTicketById(id);
    if (!ticket) {
      throw new NotFoundException('Vé không tồn tại');
    }
    return ticket;
  }

  @Get(':code/pdf')
  @ApiOperation({ summary: 'In vé theo mã vé' })
  @ApiParam({ name: 'code', description: 'Mã vé', required: true })
  async downloadTicketPdf(
    @Param('code') code: string,
    @Res() res: express.Response,
  ) {
    const buffer = await this.ticketsService.generateTicketsPdf([code]);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=ticket-${code}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
