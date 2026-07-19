import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExercisesModule } from '@/modules/exercises';
import { WorkoutPlansCoreModule } from '../../workout-plans-core.module';
import { PlanSet } from '../plan-set/entities/plan-set.entity';
import { PlanExercise } from './entities/plan-exercise.entity';
import { PlanExerciseController } from './plan-exercise.controller';
import { PlanExerciseService } from './plan-exercise.service';
import { PlanExercisesRepository } from './repositories/plan-exercises.repository';
import { PLAN_EXERCISES_REPOSITORY } from './repositories/plan-exercises.repository.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlanExercise, PlanSet]),
    ExercisesModule,
    WorkoutPlansCoreModule,
  ],
  controllers: [PlanExerciseController],
  providers: [
    PlanExercisesRepository,
    {
      provide: PLAN_EXERCISES_REPOSITORY,
      useExisting: PlanExercisesRepository,
    },
    PlanExerciseService,
  ],
  exports: [PlanExerciseService],
})
export class PlanExerciseModule {}
