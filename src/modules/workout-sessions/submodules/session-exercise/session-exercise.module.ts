import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExercisesModule } from '@/modules/exercises';
import { WorkoutSessionsCoreModule } from '../../workout-sessions-core.module';
import { SetLog } from '../set-log/entities/set-log.entity';
import { SessionExercise } from './entities/session-exercise.entity';
import { SessionExercisesRepository } from './repositories/session-exercises.repository';
import { SESSION_EXERCISES_REPOSITORY } from './repositories/session-exercises.repository.interface';
import { SessionExerciseController } from './session-exercise.controller';
import { SessionExerciseService } from './session-exercise.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SessionExercise, SetLog]),
    ExercisesModule,
    WorkoutSessionsCoreModule,
  ],
  controllers: [SessionExerciseController],
  providers: [
    SessionExercisesRepository,
    {
      provide: SESSION_EXERCISES_REPOSITORY,
      useExisting: SessionExercisesRepository,
    },
    SessionExerciseService,
  ],
  exports: [SessionExerciseService],
})
export class SessionExerciseModule {}
