import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise, ExercisesModule } from '@/modules/exercises';
import {
  SessionExercise,
  SetLog,
  WorkoutSession,
} from '@/modules/workout-sessions';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsRepository } from './repositories/analytics.repository';
import { ANALYTICS_REPOSITORY } from './repositories/analytics.repository.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkoutSession,
      SessionExercise,
      SetLog,
      Exercise,
    ]),
    ExercisesModule,
  ],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsRepository,
    {
      provide: ANALYTICS_REPOSITORY,
      useExisting: AnalyticsRepository,
    },
    AnalyticsService,
  ],
})
export class AnalyticsModule {}
