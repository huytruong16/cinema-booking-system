import { Controller, Get, Param, NotFoundException, BadRequestException } from '@nestjs/common';
import { CustomerService } from './customer.service';
import {
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiResponse,
} from '@nestjs/swagger';
import { isUUID } from 'class-validator';

@ApiTags('Khách hàng')
@Controller('customers')
export class CustomerController {
    constructor(private readonly customerService: CustomerService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách các khách hàng' })
    @ApiResponse({ status: 200, description: 'Danh sách khách hàng' })
    async getAllCustomers() {
        return this.customerService.getAllCustomers();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết khách hàng theo mã' })
    @ApiParam({ name: 'id', description: 'Mã khách hàng', required: true })
    @ApiResponse({ status: 200, description: 'Chi tiết khách hàng' })
    @ApiResponse({ status: 404, description: 'Khách hàng không tồn tại' })
    async getById(@Param('id') id: string) {
        if (!isUUID(id, '4')) throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
        return this.customerService.getCustomerById(id);
    }
}
