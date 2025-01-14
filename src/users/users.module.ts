import { MiddlewareConsumer, Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from './users.service';
import { AuthService } from 'src/auth/auth.service';
import { UsersController } from './users.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthMiddleware } from 'src/auth/auth.middleware';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [PrismaService, UsersService, AuthService],
  controllers: [UsersController],
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(UsersController);
  }
}
