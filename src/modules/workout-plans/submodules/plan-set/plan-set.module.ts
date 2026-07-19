import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanExerciseModule } from '../plan-exercise/plan-exercise.module';
import { PlanSet } from './entities/plan-set.entity';
import { PlanSetController } from './plan-set.controller';
import { PlanSetService } from './plan-set.service';
import { PlanSetsRepository } from './repositories/plan-sets.repository';
import { PLAN_SETS_REPOSITORY } from './repositories/plan-sets.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([PlanSet]), PlanExerciseModule],
  controllers: [PlanSetController],
  providers: [
    PlanSetsRepository,
    {
      provide: PLAN_SETS_REPOSITORY,
      useExisting: PlanSetsRepository,
    },
    PlanSetService,
  ],
  exports: [PlanSetService],
})
export class PlanSetModule {}
