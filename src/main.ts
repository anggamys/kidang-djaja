import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { CustomExceptionFilter } from './helpers/custom-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  dotenv.config();

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new CustomExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
