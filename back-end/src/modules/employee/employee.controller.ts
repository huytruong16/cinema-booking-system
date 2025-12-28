import {
  Controller,
  Get,
  Param,
  BadRequestException,
  Delete,
  Body,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import { Roles } from 'src/libs/common/decorators/role.decorator';
import { UpdateEmployeeDto } from './dtos/update-employee.dto';
import { JwtAuthGuard } from 'src/libs/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/libs/common/guards/role.guard';
import { RoleEnum } from 'src/libs/common/enums';

@ApiTags('Nhân viên')
@ApiBearerAuth()
@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.NHANVIEN)
  @ApiOperation({ summary: 'Lấy danh sách các nhân viên' })
  async getAllEmployees() {
    return this.employeeService.getAllEmployees();
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.NHANVIEN)
  @ApiOperation({ summary: 'Lấy chi tiết nhân viên theo mã' })
  @ApiParam({ name: 'id', description: 'Mã nhân viên', required: true })
  async getEmployeeById(@Param('id') id: string) {
    if (!isUUID(id, '4'))
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    return this.employeeService.getEmployeeById(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.NHANVIEN)
  @ApiOperation({
    summary: 'Admin cập nhật ngày vào làm và trạng thái nhân viên (partial)',
  })
  @ApiParam({ name: 'id', description: 'Mã nhân viên', required: true })
  async updateEmployee(
    @Param('id') id: string,
    @Body() updateDto: UpdateEmployeeDto,
  ) {
    if (!isUUID(id, '4')) {
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    }

    return this.employeeService.updateEmployee(id, updateDto);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.NHANVIEN)
  @ApiOperation({
    summary: 'Admin xoá mềm nhân viên',
  })
  @ApiParam({ name: 'id', description: 'Mã nhân viên', required: true })
  async removeEmployee(@Param('id') id: string) {
    if (!isUUID(id, '4')) {
      throw new BadRequestException('Tham số id phải là UUID v4 hợp lệ');
    }

    return this.employeeService.removeEmployee(id);
  }
}
