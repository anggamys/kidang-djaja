import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    // JwtModule.register({
    //   secret: process.env.JWT_SECRET,
    //   signOptions: { expiresIn: '1d' },
    // }),
  ],
  providers: [AuthService, PrismaService, JwtService],
  exports: [AuthService, JwtService],
  controllers: [AuthController],
})
export class AuthModule {}
