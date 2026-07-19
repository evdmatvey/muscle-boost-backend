import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, type EntityManager, Not, Repository } from 'typeorm';
import { BaseRepository } from '@/common/repositories/base.repository';
import { PlanExerciseNotFoundException } from '../../../exceptions/plan-exercise-not-found.exception';
import { PlanSet } from '../../plan-set/entities/plan-set.entity';
import { PlanExercise } from '../entities/plan-exercise.entity';
import type {
  CreatePlanExerciseWithSetsData,
  IPlanExercisesRepository,
} from './plan-exercises.repository.interface';

@Injectable()
export class PlanExercisesRepository
  extends BaseRepository<PlanExercise>
  implements IPlanExercisesRepository
{
  public constructor(
    @InjectRepository(PlanExercise)
    repository: Repository<PlanExercise>,
    private readonly _dataSource: DataSource,
  ) {
    super(repository);
  }

  public async findOwnedById(
    userId: string,
    planId: string,
    id: string,
  ): Promise<PlanExercise | null> {
    return this._repository
      .createQueryBuilder('planExercise')
      .innerJoin('planExercise.plan', 'plan')
      .where('planExercise.id = :id', { id })
      .andWhere('planExercise.planId = :planId', { planId })
      .andWhere('plan.userId = :userId', { userId })
      .getOne();
  }

  public async findOwnedDetail(
    userId: string,
    planId: string,
    id: string,
  ): Promise<PlanExercise | null> {
    return this._repository
      .createQueryBuilder('planExercise')
      .innerJoin('planExercise.plan', 'plan')
      .leftJoinAndSelect('planExercise.exercise', 'exercise')
      .leftJoinAndSelect('planExercise.planSets', 'planSets')
      .where('planExercise.id = :id', { id })
      .andWhere('planExercise.planId = :planId', { planId })
      .andWhere('plan.userId = :userId', { userId })
      .orderBy('planSets.setNumber', 'ASC')
      .getOne();
  }

  public async createWithSets(
    data: CreatePlanExerciseWithSetsData,
  ): Promise<PlanExercise> {
    return this._dataSource.transaction(async (manager) => {
      const planExercise = manager.create(PlanExercise, {
        planId: data.planId,
        exerciseId: data.exerciseId,
        orderIndex: data.orderIndex,
        notes: data.notes,
      });
      const saved = await manager.save(planExercise);

      const sets = data.sets.map((set) =>
        manager.create(PlanSet, {
          planExerciseId: saved.id,
          setNumber: set.setNumber,
          targetReps: set.targetReps,
          targetWeightKg: set.targetWeightKg,
          targetRestSec: set.targetRestSec,
        }),
      );

      await manager.save(sets);

      return this._findDetailById(manager, saved.id);
    });
  }

  public async updateMeta(
    planExercise: PlanExercise,
    data: { orderIndex?: number; notes?: string | null },
  ): Promise<PlanExercise> {
    if (data.orderIndex !== undefined) {
      planExercise.orderIndex = data.orderIndex;
    }

    if (data.notes !== undefined) {
      planExercise.notes = data.notes;
    }

    return this._repository.save(planExercise);
  }

  public async softDeleteWithSets(id: string): Promise<void> {
    await this._dataSource.transaction(async (manager) => {
      await manager.softDelete(PlanSet, { planExerciseId: id });
      await manager.softDelete(PlanExercise, id);
    });
  }

  public async existsOrderIndex(
    planId: string,
    orderIndex: number,
    excludeId?: string,
  ): Promise<boolean> {
    const where = excludeId
      ? { planId, orderIndex, id: Not(excludeId) }
      : { planId, orderIndex };

    const count = await this._repository.count({ where });

    return count > 0;
  }

  private async _findDetailById(
    manager: EntityManager,
    id: string,
  ): Promise<PlanExercise> {
    const detail = await manager.findOne(PlanExercise, {
      where: { id },
      relations: {
        exercise: true,
        planSets: true,
      },
      order: {
        planSets: {
          setNumber: 'ASC',
        },
      },
    });

    if (!detail) {
      throw new PlanExerciseNotFoundException();
    }

    return detail;
  }
}
