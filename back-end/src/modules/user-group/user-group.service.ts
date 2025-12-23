import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { quyen } from '@prisma/client';
import { CreateUserGroupDto } from './dtos/create-user-group.dto';
import { UpdateUserGroupDto } from './dtos/update-user-group.dto';
import { UpdateGroupPermissionsDto } from './dtos/update-group-permissions.dto';
import { CursorUtils } from 'src/libs/common/utils/pagination.util';
import { GetUsersInGroupDto } from './dtos/get-users-in-group.dto';

@Injectable()
export class UserGroupService {
    constructor(private readonly prisma: PrismaService) { }
    async getAllGroups() {
        return this.prisma.nHOMNGUOIDUNG.findMany({
            where: { DeletedAt: null },
            orderBy: { CreatedAt: 'desc' },
            include: {
                QuyenNhomNguoiDungs: true,
            },
        });
    }

    async getGroupById(id: string) {
        const group = await this.prisma.nHOMNGUOIDUNG.findFirst({
            where: {
                MaNhomNguoiDung: id,
                DeletedAt: null,
            },
            include: {
                QuyenNhomNguoiDungs: true,
                NguoiDungPhanMems: true,
            },
        });

        if (!group) {
            throw new NotFoundException('Nhóm người dùng không tồn tại');
        }

        return group;
    }

    async getUsersByGroupId(
        groupId: string,
        query: GetUsersInGroupDto,
    ) {
        const group = await this.prisma.nHOMNGUOIDUNG.findFirst({
            where: { MaNhomNguoiDung: groupId, DeletedAt: null },
        });

        if (!group) {
            throw new NotFoundException('Nhóm người dùng không tồn tại');
        }

        const whereConditions: any = { MaNhomNguoiDung: groupId, DeletedAt: null };

        const [data, pagination] = await this.prisma.xprisma.nGUOIDUNGPHANMEM
            .paginate({
                where: whereConditions,
                orderBy: [{ CreatedAt: 'desc' }, { MaNguoiDung: 'desc' }],
                select: {
                    MaNguoiDung: true,
                    HoTen: true,
                    Email: true,
                    TrangThai: true,
                    CreatedAt: true,
                },
            })
            .withCursor(CursorUtils.getPrismaOptions(query, 'MaNguoiDung'));

        return { data, pagination };
    }

    async createGroup(dto: CreateUserGroupDto) {
        const { TenNhomNguoiDung, permissions = [] } = dto;

        const existed = await this.prisma.nHOMNGUOIDUNG.findFirst({
            where: {
                TenNhomNguoiDung,
                DeletedAt: null,
            },
        });

        if (existed) {
            throw new ConflictException('Tên nhóm người dùng đã tồn tại');
        }

        return this.prisma.$transaction(async (tx) => {
            const group = await tx.nHOMNGUOIDUNG.create({
                data: {
                    TenNhomNguoiDung,
                },
            });

            if (permissions.length > 0) {
                await tx.qUYEN_NHOMNGUOIDUNG.createMany({
                    data: permissions.map((p) => ({
                        MaNhomNguoiDung: group.MaNhomNguoiDung,
                        Quyen: p as quyen,
                    })),
                });
            }

            return {
                message: 'Tạo nhóm người dùng thành công',
                group,
            };
        });
    }

    async updateGroup(id: string, dto: UpdateUserGroupDto) {
        const group = await this.prisma.nHOMNGUOIDUNG.findFirst({
            where: {
                MaNhomNguoiDung: id,
                DeletedAt: null,
            },
        });

        if (!group) {
            throw new NotFoundException('Nhóm người dùng không tồn tại');
        }

        if (dto.TenNhomNguoiDung) {
            const existed = await this.prisma.nHOMNGUOIDUNG.findFirst({
                where: {
                    TenNhomNguoiDung: dto.TenNhomNguoiDung,
                    DeletedAt: null,
                    NOT: { MaNhomNguoiDung: id },
                },
            });

            if (existed) {
                throw new ConflictException('Tên nhóm người dùng đã tồn tại');
            }
        }

        const updated = await this.prisma.nHOMNGUOIDUNG.update({
            where: { MaNhomNguoiDung: id },
            data: {
                TenNhomNguoiDung: dto.TenNhomNguoiDung,
                UpdatedAt: new Date(),
            },
        });

        return {
            message: 'Cập nhật tên nhóm người dùng thành công',
            group: updated,
        };
    }

    async updateGroupPermissions(dto: UpdateGroupPermissionsDto) {
        const { groupId, permissions } = dto;

        const group = await this.prisma.nHOMNGUOIDUNG.findFirst({
            where: {
                MaNhomNguoiDung: groupId,
                DeletedAt: null,
            },
        });

        if (!group) {
            throw new NotFoundException('Nhóm người dùng không tồn tại');
        }

        const mappedPermissions: quyen[] = permissions.map((p) => p as quyen);

        return this.prisma.$transaction(async (tx) => {
            await tx.qUYEN_NHOMNGUOIDUNG.deleteMany({
                where: { MaNhomNguoiDung: groupId },
            });

            if (mappedPermissions.length > 0) {
                await tx.qUYEN_NHOMNGUOIDUNG.createMany({
                    data: mappedPermissions.map((permission) => ({
                        MaNhomNguoiDung: groupId,
                        Quyen: permission,
                    })),
                });
            }

            return {
                message: 'Cập nhật quyền cho nhóm người dùng thành công',
            };
        });
    }

    async deleteGroup(id: string) {
        const group = await this.prisma.nHOMNGUOIDUNG.findFirst({
            where: {
                MaNhomNguoiDung: id,
                DeletedAt: null,
            },
            include: {
                NguoiDungPhanMems: {
                    where: {
                        DeletedAt: null,
                    },
                    select: {
                        MaNguoiDung: true,
                    },
                },
            },
        });

        if (!group) {
            throw new NotFoundException('Nhóm người dùng không tồn tại');
        }

        if (group.NguoiDungPhanMems.length > 0) {
            throw new ConflictException(
                'Không thể xóa nhóm vì vẫn còn người dùng đang được gán vào nhóm này',
            );
        }

        await this.prisma.nHOMNGUOIDUNG.update({
            where: { MaNhomNguoiDung: id },
            data: {
                DeletedAt: new Date(),
            },
        });

        return {
            message: 'Xóa nhóm người dùng thành công',
        };
    }
}
