
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

type AdminTokenPayload = {
  sub: string;
  role: string;
};

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException(
        'Autentificarea este necesară.',
      );
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException(
        'Tokenul de autentificare lipsește sau este invalid.',
      );
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new UnauthorizedException(
        'Autentificarea nu este configurată.',
      );
    }

    let payload: AdminTokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<AdminTokenPayload>(
        token,
        { secret },
      );
    } catch {
      throw new UnauthorizedException(
        'Tokenul este invalid sau a expirat.',
      );
    }

    if (payload.sub !== 'admin' || payload.role !== 'admin') {
      throw new ForbiddenException(
        'Doar administratorul poate efectua această operație.',
      );
    }

    return true;
  }
}
