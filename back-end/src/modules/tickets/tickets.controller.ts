import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Vé')
@Controller('tickets')
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) { }

    @Get()
    findAll() {
        return this.ticketsService.getTickets();
    }

    @Get(':id')
    @ApiParam({ name: 'id', description: 'Mã vé', required: true })
    findOne(@Param('id') id: string) {
        const ticket = this.ticketsService.getTicketById(id);
        if (!ticket) {
            throw new NotFoundException('Vé không tồn tại');
        }
        return ticket;
    }
}
