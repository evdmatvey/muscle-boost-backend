import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainExceptionFilter } from '@/common/filters';
import { getDatabaseConfig } from '@/config/database.config';
import { validateEnv } from '@/config/env.validation';
import { UsersModule } from '@/modules/users';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    TypeOrmModule.forRoot({
      ...getDatabaseConfig(),
    }),
    UsersModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
  ],
})
export class AppModule {}
