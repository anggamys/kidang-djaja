import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { TransactionsModule } from './transactions/transactions.module';
import { FilesModule } from './files/files.module';
import { CategoriesModule } from './categories/categories.module';
import { AuthMiddleware } from './auth/auth.middleware';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    AuthModule,
    ProductsModule,
    TransactionsModule,
    FilesModule,
    CategoriesModule,
  ],
  controllers: [AppController, UsersController],
  providers: [AppService, UsersService, PrismaService, AuthService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
