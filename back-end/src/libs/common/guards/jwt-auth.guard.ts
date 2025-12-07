import { Injectable, ExecutionContext, UnauthorizedException, CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) return true;

        const req = context.switchToHttp().getRequest();
        const authHeader = (req.headers?.authorization || '') as string;

        if (!authHeader) {
            throw new UnauthorizedException('Missing Authorization header');
        }

        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7).trim()
            : authHeader.trim();

        if (!token) {
            throw new UnauthorizedException('Missing token');
        }

        try {
            const secret = process.env.JWT_SECRET || 'default_jwt_secret';
            const payload = jwt.verify(token, secret);
            req.user = payload;
            return true;
        } catch (err) {
            throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn.');
        }
    }
}