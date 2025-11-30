import { Controller, Get, Param } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Nhân viên')
@Controller('employees')
export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách các nhân viên' })
    async getAllEmployees() {
        return this.employeeService.getAllEmployees();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết nhân viên theo mã' })
    @ApiParam({ name: 'id', description: 'Mã nhân viên', required: true })
    async getEmployeeById(@Param('id') id: string) {
        return this.employeeService.getEmployeeById(id);
    }
}