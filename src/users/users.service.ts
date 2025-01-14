import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import { AuthService } from 'src/auth/auth.service';
import { UserRole } from '@prisma/client';
import { ApiResponse } from 'src/helpers/response.helper';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const { username, email, password, role, fullName, address, phoneNumber } =
      createUserDto;

    try {
      // Check if user already exists
      const existingUser = await this.prismaService.users.findUnique({
        where: {
          email,
        },
      });

      if (existingUser) {
        ApiResponse.error(HttpStatus.BAD_REQUEST, 'User telah ada');
      }

      // Hash the password before storing it
      const hashedPassword = await this.authService.hashPassword(password);

      // default role is 'USER'
      const defaultRole = UserRole.CUSTOMER;

      // Create a new user
      const user = await this.prismaService.users.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role: role || defaultRole,
          userDetails: {
            create: {
              fullName,
              address,
              phone: phoneNumber,
            },
          },
        },
      });

      return ApiResponse.success(HttpStatus.CREATED, 'User telah dibuat', user);
    } catch (error) {
      return ApiResponse.error(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'An error occurred while creating the user',
        error.message || 'Unknown error',
      );
    }
  }

  async getUserById(userId: string) {
    try {
      const user = await this.prismaService.users.findUnique({
        where: {
          id: Number(userId),
        },
        include: {
          userDetails: true,
        },
      });

      if (!user) {
        return ApiResponse.error(HttpStatus.NOT_FOUND, 'User tidak ditemukan');
      }

      return ApiResponse.success(HttpStatus.OK, 'User ditemukan', user);
    } catch (error) {
      return ApiResponse.error(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'An error occurred while fetching the user',
        error.message || 'Unknown error',
      );
    }
  }

  async getAllUsers() {
    try {
      const users = await this.prismaService.users.findMany({
        include: {
          userDetails: true,
        },
      });

      return ApiResponse.success(HttpStatus.OK, 'Users found', users);
    } catch (error) {
      return ApiResponse.error(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'An error occurred while fetching the users',
        error.message || 'Unknown error',
      );
    }
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {}
}
