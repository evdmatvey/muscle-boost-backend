import { Module } from '@nestjs/common';
import { PlanExerciseModule } from './submodules/plan-exercise/plan-exercise.module';
import { PlanSetModule } from './submodules/plan-set/plan-set.module';
import { WorkoutPlansCoreModule } from './workout-plans-core.module';

@Module({
  imports: [WorkoutPlansCoreModule, PlanExerciseModule, PlanSetModule],
  exports: [WorkoutPlansCoreModule],
})
export class WorkoutPlansModule {}
