import {
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  Body,
  BadRequestException,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { isUUID } from 'class-validator';

import { UserGroupService } from './user-group.service';
import { JwtAuthGuard } from 'src/libs/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/libs/common/guards/role.guard';
import { Roles } from 'src/libs/common/decorators/role.decorator';
import { RoleEnum } from 'src/libs/common/enums';

import { CreateUserGroupDto } from './dtos/create-user-group.dto';
import { UpdateUserGroupDto } from './dtos/update-user-group.dto';
import { UpdateGroupPermissionsDto } from './dtos/update-group-permissions.dto';
import { GetUsersInGroupDto } from './dtos/get-users-in-group.dto';

@ApiTags('Nhóm người dùng')
@Controller('user-groups')
export class UserGroupController {
  constructor(private readonly userGroupService: UserGroupService) {}
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ADMIN lấy danh sách nhóm người dùng' })
  async getAllGroups() {
    return this.userGroupService.getAllGroups();
  }

  @Patch('permissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ADMIN cập nhật quyền cho nhóm người dùng' })
  @ApiBody({
    description: 'Danh sách quyền của nhóm',
    type: UpdateGroupPermissionsDto,
  })
  async updateGroupPermissions(@Body() dto: UpdateGroupPermissionsDto) {
    return this.userGroupService.updateGroupPermissions(dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ADMIN lấy chi tiết nhóm người dùng' })
  @ApiParam({
    name: 'id',
    description: 'Mã nhóm người dùng (UUID v4)',
  })
  async getGroupById(@Param('id') id: string) {
    if (!isUUID(id, '4')) {
      throw new BadRequestException('Id phải là UUID v4 hợp lệ');
    }

    return this.userGroupService.getGroupById(id);
  }

  @Get(':id/users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ADMIN lấy danh sách người dùng theo nhóm' })
  @ApiParam({
    name: 'id',
    description: 'Mã nhóm người dùng (UUID v4)',
  })
  async getUsersByGroup(
    @Param('id') id: string,
    @Query() query: GetUsersInGroupDto,
  ) {
    if (!isUUID(id, '4')) {
      throw new BadRequestException('Id phải là UUID v4 hợp lệ');
    }

    return this.userGroupService.getUsersByGroupId(id, query);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ADMIN tạo nhóm người dùng' })
  @ApiBody({
    description: 'Thông tin tạo nhóm người dùng',
    type: CreateUserGroupDto,
  })
  @ApiResponse({ status: 201, description: 'Tạo nhóm người dùng thành công' })
  @ApiResponse({ status: 409, description: 'Tên nhóm đã tồn tại' })
  async createGroup(@Body() dto: CreateUserGroupDto) {
    return this.userGroupService.createGroup(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ADMIN cập nhật tên nhóm người dùng' })
  @ApiParam({
    name: 'id',
    description: 'Mã nhóm người dùng (UUID v4)',
  })
  @ApiBody({
    description: 'Thông tin cập nhật nhóm người dùng',
    type: UpdateUserGroupDto,
  })
  async updateGroup(@Param('id') id: string, @Body() dto: UpdateUserGroupDto) {
    if (!isUUID(id, '4')) {
      throw new BadRequestException('Id phải là UUID v4 hợp lệ');
    }

    return this.userGroupService.updateGroup(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ADMIN xóa nhóm người dùng (soft delete)' })
  @ApiParam({
    name: 'id',
    description: 'Mã nhóm người dùng (UUID v4)',
  })
  async deleteGroup(@Param('id') id: string) {
    if (!isUUID(id, '4')) {
      throw new BadRequestException('Id phải là UUID v4 hợp lệ');
    }

    return this.userGroupService.deleteGroup(id);
  }
}
