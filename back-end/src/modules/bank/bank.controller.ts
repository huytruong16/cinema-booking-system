import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BankService } from './bank.service';

@ApiTags('Ngân hàng')
@Controller('banks')
export class BankController {
    constructor(private readonly bankService: BankService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách các ngân hàng' })
    async getAllBanks() {
        return this.bankService.getAllBanks();
    }
}
