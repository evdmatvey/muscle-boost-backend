import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { ValidationError } from 'class-validator';
import { RequestValidationException } from '@/common/exceptions';
import { formatValidationErrors } from '@/common/utils';
import { AppModule } from './app.module';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors: ValidationError[]) => {
        return new RequestValidationException(formatValidationErrors(errors));
      },
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('APP_PORT');

  await app.listen(port);
};

void bootstrap();
