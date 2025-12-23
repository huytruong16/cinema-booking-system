import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

import { UserGroupService } from './user-group.service';
import { UserGroupController } from './user-group.controller';

@Module({
    imports: [PrismaModule],
    controllers: [UserGroupController],
    providers: [UserGroupService],
    exports: [UserGroupService],
})
export class UserGroupModule { }
