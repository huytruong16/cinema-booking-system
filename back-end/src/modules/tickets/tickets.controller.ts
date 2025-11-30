import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Vé')
@Controller('tickets')
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách các vé' })
    findAll() {
        return this.ticketsService.getTickets();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết vé theo mã' })
    @ApiParam({ name: 'id', description: 'Mã vé', required: true })
    findOne(@Param('id') id: string) {
        const ticket = this.ticketsService.getTicketById(id);
        if (!ticket) {
            throw new NotFoundException('Vé không tồn tại');
        }
        return ticket;
    }
}
