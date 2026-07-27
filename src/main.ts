import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { ValidationError } from 'class-validator';
import { Logger } from 'nestjs-pino';
import { RequestValidationException } from '@/common/exceptions';
import { formatValidationErrors } from '@/common/utils';
import { AppModule } from './app.module';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService);

  app.useLogger(app.get(Logger));
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

  const allowedOrigin = configService.get<string>('ALLOWED_ORIGIN');

  if (allowedOrigin) {
    app.enableCors({ origin: allowedOrigin });
  }

  const appEnv = configService.getOrThrow<string>('APP_ENV');

  if (appEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Muscle Boost API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup('api/docs', app, document);
  }

  const port = configService.getOrThrow<number>('APP_PORT');

  await app.listen(port);
};

void bootstrap();
