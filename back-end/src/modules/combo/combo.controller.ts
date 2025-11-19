import {
    Controller,
    Get,
    Param,
    NotFoundException,
    Delete,
    Patch,
    BadRequestException,
    Post,
    UseInterceptors,
    Body,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator
} from '@nestjs/common';
import { ComboService } from './combo.service';
import {
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiConsumes,
    ApiBody
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateComboDto } from './dtos/create-combo.dto';
import { UpdateComboDto } from './dtos/update-combo.dto';

@ApiTags('Combo')
@Controller('combos')
export class ComboController {
    constructor(private readonly comboService: ComboService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách các combo' })
    @ApiResponse({ status: 200, description: 'Danh sách combo được trả về thành công.' })
    async getAllCombos() {
        return this.comboService.getAllCombos();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết combo theo mã' })
    @ApiParam({ name: 'id', description: 'Mã combo', required: true })
    @ApiResponse({ status: 200, description: 'Thông tin combo được trả về thành công.' })
    @ApiResponse({ status: 404, description: 'Combo không tồn tại.' })
    async getById(@Param('id') id: string) {
        return this.comboService.getComboById(id);
    }

    @Post()
    @ApiOperation({ summary: 'Tạo combo mới' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Thông tin combo và ảnh đại diện (BẮT BUỘC)',
        schema: {
            type: 'object',
            properties: {
                TenCombo: {
                    type: 'string',
                    example: 'Combo Solo',
                    description: 'Tên combo'
                },
                MoTa: {
                    type: 'string',
                    example: '1 bắp + 1 nước',
                    description: 'Mô tả combo'
                },
                GiaTien: {
                    type: 'number',
                    example: 60000,
                    description: 'Giá tiền combo'
                },
                TrangThai: {
                    type: 'string',
                    example: 'CONHANG',
                    description: 'Trạng thái combo'
                },
                comboFile: {
                    type: 'string',
                    format: 'binary',
                    description: 'Ảnh đại diện combo (jpg, jpeg, png, webp)'
                }
            },
            required: ['TenCombo', 'GiaTien', 'TrangThai', 'comboFile']
        }
    })
    @ApiResponse({ status: 201, description: 'Tạo combo thành công.' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ hoặc thiếu ảnh.' })
    @UseInterceptors(FileInterceptor('comboFile'))
    async create(
        @Body() dto: CreateComboDto,
        @UploadedFile() file: Express.Multer.File
    ) {
        return await this.comboService.createCombo(dto, file);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Cập nhật combo (có thể cập nhật một phần)' })
    @ApiConsumes('multipart/form-data')
    @ApiParam({ name: 'id', description: 'Mã combo cần cập nhật', required: true })
    @ApiBody({
        description: 'Thông tin combo cập nhật và ảnh đại diện mới (tùy chọn)',
        schema: {
            type: 'object',
            properties: {
                TenCombo: {
                    type: 'string',
                    example: 'Combo Solo Updated',
                    description: 'Tên combo'
                },
                MoTa: {
                    type: 'string',
                    example: '1 bắp + 1 nước + snack',
                    description: 'Mô tả combo'
                },
                GiaTien: {
                    type: 'number',
                    example: 70000,
                    description: 'Giá tiền combo'
                },
                TrangThai: {
                    type: 'string',
                    example: 'HETHANG',
                    description: 'Trạng thái combo'
                },
                comboFile: {
                    type: 'string',
                    format: 'binary',
                    description: 'Ảnh đại diện combo mới (jpg, jpeg, png, webp)'
                }
            }
        }
    })
    @ApiResponse({ status: 200, description: 'Cập nhật combo thành công.' })
    @ApiResponse({ status: 404, description: 'Combo không tồn tại.' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
    @UseInterceptors(FileInterceptor('comboFile'))
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateComboDto,
        @UploadedFile() file?: Express.Multer.File
    ) {
        return await this.comboService.updateCombo(id, dto, file);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa mềm combo' })
    @ApiParam({ name: 'id', description: 'Mã combo cần xóa', required: true })
    @ApiResponse({ status: 200, description: 'Xóa combo thành công.' })
    @ApiResponse({ status: 404, description: 'Combo không tồn tại.' })
    async remove(@Param('id') id: string) {
        return this.comboService.removeCombo(id);
    }
}