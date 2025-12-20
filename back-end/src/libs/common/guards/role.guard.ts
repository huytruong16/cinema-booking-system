import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.vaitro) {
            throw new ForbiddenException('Không xác định được vai trò người dùng');
        }

        if (!requiredRoles.includes(user.vaitro)) {
            throw new ForbiddenException(
                'Bạn không có quyền truy cập vào tài nguyên của đường dẫn này.',
            );
        }

        return true;
    }
}
