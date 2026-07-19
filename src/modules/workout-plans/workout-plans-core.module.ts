import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExercisesModule } from '@/modules/exercises';
import { WorkoutPlan } from './entities/workout-plan.entity';
import { WORKOUT_PLAN_CONTEXT } from './interfaces/workout-plan-context.interface';
import { WorkoutPlansRepository } from './repositories/workout-plans.repository';
import { WORKOUT_PLANS_REPOSITORY } from './repositories/workout-plans.repository.interface';
import { PlanExercise } from './submodules/plan-exercise/entities/plan-exercise.entity';
import { PlanSet } from './submodules/plan-set/entities/plan-set.entity';
import { WorkoutPlansController } from './workout-plans.controller';
import { WorkoutPlansService } from './workout-plans.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkoutPlan, PlanExercise, PlanSet]),
    ExercisesModule,
  ],
  controllers: [WorkoutPlansController],
  providers: [
    WorkoutPlansRepository,
    {
      provide: WORKOUT_PLANS_REPOSITORY,
      useExisting: WorkoutPlansRepository,
    },
    WorkoutPlansService,
    {
      provide: WORKOUT_PLAN_CONTEXT,
      useExisting: WorkoutPlansService,
    },
  ],
  exports: [WorkoutPlansService, WORKOUT_PLAN_CONTEXT],
})
export class WorkoutPlansCoreModule {}
