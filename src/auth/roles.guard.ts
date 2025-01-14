import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiResponse } from 'src/helpers/response.helper';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true; // Jika tidak ada role yang ditentukan, akses diizinkan
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Pastikan user ada di request (setelah validasi auth)

    if (!user) {
      throw new ForbiddenException('User tidak ditemukan');
    }

    const hasRole = roles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException('Akses ditolak');
    }

    return true;
  }
}
