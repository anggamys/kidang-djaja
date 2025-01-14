import { UserRole } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  phoneNumber: string;
}

export class UpdateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  phoneNumber: string;
}

export class UserDto {}
