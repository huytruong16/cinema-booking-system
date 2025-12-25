import {
  Controller,
  Get,
  Post,
  NotFoundException,
  Param,
  BadRequestException,
  Query,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { GetTicketsDto } from './dtos/get-tickets.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import express from 'express';
import { RolesGuard } from 'src/libs/common/guards/role.guard';
import { JwtAuthGuard } from 'src/libs/common/guards/jwt-auth.guard';
import { RoleEnum } from 'src/libs/common/enums';
import { Roles } from 'src/libs/common/decorators/role.decorator';

@ApiTags('Vé')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) { }

  @Post('checkin/:code')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.NHANVIEN, RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Checkin vé bằng mã cho nhân viên soát vé' })
  @ApiParam({ name: 'code', description: 'Mã vé', required: true })
  async checkin(@Param('code') code: string) {
    return await this.ticketsService.checkinTicketByCode(code);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy danh sách các vé' })
  async findAll(@Req() req, @Query() filters: GetTicketsDto) {
    return await this.ticketsService.getTickets(
      req.user.id,
      req.user.vaitro,
      filters,
    );
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy chi tiết vé theo mã' })
  @ApiParam({ name: 'id', description: 'Mã vé', required: true })
  async findOne(@Req() req, @Param('id') id: string) {
    if (!isUUID(id, '4'))
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    const ticket = await this.ticketsService.getTicketById(
      req.user.id,
      req.user.vaitro,
      id,
    );
    if (!ticket) {
      throw new NotFoundException('Vé không tồn tại');
    }
    return ticket;
  }

  @Get(':code/pdf')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.NHANVIEN, RoleEnum.ADMIN)
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
