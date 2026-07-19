import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { BaseRepository } from '@/common/repositories/base.repository';
import { PlanSet } from '../entities/plan-set.entity';
import type {
  CreatePlanSetData,
  IPlanSetsRepository,
  UpdatePlanSetData,
} from './plan-sets.repository.interface';

@Injectable()
export class PlanSetsRepository
  extends BaseRepository<PlanSet>
  implements IPlanSetsRepository
{
  public constructor(
    @InjectRepository(PlanSet)
    repository: Repository<PlanSet>,
  ) {
    super(repository);
  }

  public async findOwnedById(
    userId: string,
    planId: string,
    planExerciseId: string,
    id: string,
  ): Promise<PlanSet | null> {
    return this._repository
      .createQueryBuilder('planSet')
      .innerJoin('planSet.planExercise', 'planExercise')
      .innerJoin('planExercise.plan', 'plan')
      .where('planSet.id = :id', { id })
      .andWhere('planSet.planExerciseId = :planExerciseId', { planExerciseId })
      .andWhere('planExercise.planId = :planId', { planId })
      .andWhere('plan.userId = :userId', { userId })
      .getOne();
  }

  public async create(data: CreatePlanSetData): Promise<PlanSet> {
    const planSet = this._repository.create({
      planExerciseId: data.planExerciseId,
      setNumber: data.setNumber,
      targetReps: data.targetReps,
      targetWeightKg: data.targetWeightKg,
      targetRestSec: data.targetRestSec,
    });

    return this._repository.save(planSet);
  }

  public async updateMeta(
    planSet: PlanSet,
    data: UpdatePlanSetData,
  ): Promise<PlanSet> {
    if (data.setNumber !== undefined) {
      planSet.setNumber = data.setNumber;
    }

    if (data.targetReps !== undefined) {
      planSet.targetReps = data.targetReps;
    }

    if (data.targetWeightKg !== undefined) {
      planSet.targetWeightKg = data.targetWeightKg;
    }

    if (data.targetRestSec !== undefined) {
      planSet.targetRestSec = data.targetRestSec;
    }

    return this._repository.save(planSet);
  }

  public async existsSetNumber(
    planExerciseId: string,
    setNumber: number,
    excludeId?: string,
  ): Promise<boolean> {
    const where = excludeId
      ? { planExerciseId, setNumber, id: Not(excludeId) }
      : { planExerciseId, setNumber };

    const count = await this._repository.count({ where });

    return count > 0;
  }
}
