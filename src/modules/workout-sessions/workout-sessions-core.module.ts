import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExercisesModule } from '@/modules/exercises';
import { WorkoutPlansModule } from '@/modules/workout-plans';
import { WorkoutSession } from './entities/workout-session.entity';
import { WORKOUT_SESSION_CONTEXT } from './interfaces/workout-session-context.interface';
import { WorkoutSessionsRepository } from './repositories/workout-sessions.repository';
import { WORKOUT_SESSIONS_REPOSITORY } from './repositories/workout-sessions.repository.interface';
import { SessionExercise } from './submodules/session-exercise/entities/session-exercise.entity';
import { SetLog } from './submodules/set-log/entities/set-log.entity';
import { WorkoutSessionsController } from './workout-sessions.controller';
import { WorkoutSessionsService } from './workout-sessions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkoutSession, SessionExercise, SetLog]),
    ExercisesModule,
    WorkoutPlansModule,
  ],
  controllers: [WorkoutSessionsController],
  providers: [
    WorkoutSessionsRepository,
    {
      provide: WORKOUT_SESSIONS_REPOSITORY,
      useExisting: WorkoutSessionsRepository,
    },
    WorkoutSessionsService,
    {
      provide: WORKOUT_SESSION_CONTEXT,
      useExisting: WorkoutSessionsService,
    },
  ],
  exports: [WorkoutSessionsService, WORKOUT_SESSION_CONTEXT],
})
export class WorkoutSessionsCoreModule {}
