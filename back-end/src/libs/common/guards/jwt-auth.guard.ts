import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  CanActivate,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers?.authorization as string | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();

      if (token) {
        try {
          const secret = process.env.JWT_SECRET || 'default_jwt_secret';
          const payload = jwt.verify(token, secret);
          req.user = payload;
        } catch {
          if (!isPublic) {
            throw new UnauthorizedException(
              'Token không hợp lệ hoặc đã hết hạn.',
            );
          }
        }
      }
    }

    if (!isPublic && !req.user) {
      throw new UnauthorizedException('Vui lòng đăng nhập để tiếp tục');
    }

    return true;
  }
}
