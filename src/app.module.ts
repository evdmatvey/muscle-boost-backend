import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainExceptionFilter } from '@/common/filters';
import { getDatabaseConfig } from '@/config/database.config';
import { validateEnv } from '@/config/env.validation';
import { AnalyticsModule } from '@/modules/analytics';
import { AuthModule } from '@/modules/auth';
import { ExercisesModule } from '@/modules/exercises';
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
    TypeOrmModule.forRoot({
      ...getDatabaseConfig(),
    }),
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
      useClass: DomainExceptionFilter,
    },
  ],
})
export class AppModule {}
