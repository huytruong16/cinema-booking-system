import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
  Query
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery
} from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import { Roles } from 'src/libs/common/decorators/role.decorator';
import { RoleEnum } from 'src/libs/common/enums/role.enum';
import { JwtAuthGuard } from 'src/libs/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/libs/common/guards/role.guard';
import { UserStatusEnum } from 'src/libs/common/enums';
import { FilterCustomerDto } from './dtos/filter-customer.dto';

@ApiTags('Khách hàng')
@ApiBearerAuth()
@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) { }

  @Get()
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({
    summary: 'Lấy danh sách khách hàng (phân trang & filter)',
  })
  @ApiQuery({ name: 'fromCreatedAt', required: false, example: '2024-01-01' })
  @ApiQuery({ name: 'toCreatedAt', required: false, example: '2024-12-31' })
  @ApiQuery({
    name: 'TrangThaiNguoiDung',
    required: false,
    enum: UserStatusEnum,
  })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Danh sách khách hàng' })
  async getAllCustomers(@Query() query: FilterCustomerDto) {
    return this.customerService.getAllCustomers(query);
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Lấy chi tiết khách hàng theo mã' })
  @ApiParam({ name: 'id', description: 'Mã khách hàng', required: true })
  @ApiResponse({ status: 200, description: 'Chi tiết khách hàng' })
  @ApiResponse({ status: 404, description: 'Khách hàng không tồn tại' })
  async getById(@Param('id') id: string) {
    if (!isUUID(id, '4'))
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    return this.customerService.getCustomerById(id);
  }

  // @Delete(':id')
  // @Roles(RoleEnum.ADMIN)
  // @ApiOperation({ summary: 'Admin xoá mềm khách hàng' })
  // @ApiParam({ name: 'id', description: 'Mã khách hàng', required: true })
  // @ApiResponse({ status: 200, description: 'Xoá khách hàng thành công' })
  // @ApiResponse({ status: 404, description: 'Khách hàng không tồn tại' })
  // async removeCustomer(@Param('id') id: string) {
  //   if (!isUUID(id, '4')) {
  //     throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
  //   }

  //   return this.customerService.removeCustomer(id);
  // }
}
