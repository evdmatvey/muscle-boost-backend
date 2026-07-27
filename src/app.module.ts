import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { AllExceptionsFilter, DomainExceptionFilter } from '@/common/filters';
import { getDatabaseConfig } from '@/config/database.config';
import { validateEnv } from '@/config/env.validation';
import { getLoggerParams } from '@/config/logger.config';
import { AnalyticsModule } from '@/modules/analytics';
import { AuthModule } from '@/modules/auth';
import { ExercisesModule } from '@/modules/exercises';
import { HealthModule } from '@/modules/health';
import { UserProfilesModule } from '@/modules/user-profiles';
import { UsersModule } from '@/modules/users';
import { WorkoutPlansModule } from '@/modules/workout-plans';
import { WorkoutSessionsModule } from '@/modules/workout-sessions';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getLoggerParams({
          appEnv: configService.getOrThrow<string>('APP_ENV'),
          logLevel: configService.get<string>('LOG_LEVEL') ?? 'info',
        }),
    }),
    TypeOrmModule.forRoot({
      ...getDatabaseConfig(),
    }),
    HealthModule,
    UsersModule,
    AuthModule,
    UserProfilesModule,
    ExercisesModule,
    WorkoutPlansModule,
    WorkoutSessionsModule,
    AnalyticsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
  ],
})
export class AppModule {}
