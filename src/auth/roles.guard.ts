import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiResponse } from 'src/helpers/response.helper';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    this.logger.log('Memulai pengecekan peran user...');
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      this.logger.log('Tidak ada peran yang ditentukan. Akses diizinkan.');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Pastikan user ada di request (setelah validasi auth)

    if (!user) {
      this.logger.warn('User tidak ditemukan di dalam request.');
      throw new HttpException(
        ApiResponse.error(HttpStatus.FORBIDDEN, 'User tidak ditemukan'),
        HttpStatus.FORBIDDEN,
      );
    }

    this.logger.debug(`Peran yang dibutuhkan: ${JSON.stringify(roles)}`);
    this.logger.debug(`Peran user: ${user.role}`);

    const hasRole = roles.some((role) => user.role === role);

    if (!hasRole) {
      this.logger.error(
        `Akses ditolak untuk user dengan peran: ${user.role}. Peran yang dibutuhkan: ${roles.join(', ')}`,
      );
      throw new ForbiddenException(
        ApiResponse.error(HttpStatus.FORBIDDEN, 'Akses ditolak'),
      );
    }

    this.logger.log(`User dengan peran ${user.role} memiliki akses.`);
    return true;
  }
}
