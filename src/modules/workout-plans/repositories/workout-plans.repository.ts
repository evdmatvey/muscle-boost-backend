import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, type EntityManager, In, Repository } from 'typeorm';
import type { MuscleGroup, WorkoutType } from '@/common/enums';
import { BaseRepository } from '@/common/repositories/base.repository';
import { WorkoutPlan } from '../entities/workout-plan.entity';
import { WorkoutPlanNotFoundException } from '../exceptions/workout-plan-not-found.exception';
import { PlanExercise } from '../submodules/plan-exercise/entities/plan-exercise.entity';
import { PlanSet } from '../submodules/plan-set/entities/plan-set.entity';
import type { PlanExerciseInput } from '../types/plan-aggregate.types';
import type {
  CreateWorkoutPlanAggregateData,
  FindWorkoutPlansFilters,
  FindWorkoutPlansResult,
  IWorkoutPlansRepository,
  ReplaceWorkoutPlanAggregateData,
  WorkoutPlanListRow,
} from './workout-plans.repository.interface';

@Injectable()
export class WorkoutPlansRepository
  extends BaseRepository<WorkoutPlan>
  implements IWorkoutPlansRepository
{
  public constructor(
    @InjectRepository(WorkoutPlan)
    repository: Repository<WorkoutPlan>,
    private readonly _dataSource: DataSource,
  ) {
    super(repository);
  }

  public async findOwnedById(
    userId: string,
    id: string,
  ): Promise<WorkoutPlan | null> {
    return this._repository.findOne({
      where: { id, userId },
    });
  }

  public async findOwnedDetail(
    userId: string,
    id: string,
  ): Promise<WorkoutPlan | null> {
    return this._repository.findOne({
      where: { id, userId },
      relations: {
        planExercises: {
          exercise: true,
          planSets: true,
        },
      },
      order: {
        planExercises: {
          orderIndex: 'ASC',
          planSets: {
            setNumber: 'ASC',
          },
        },
      },
    });
  }

  public async findMany(
    filters: FindWorkoutPlansFilters,
  ): Promise<FindWorkoutPlansResult> {
    const query = this._repository
      .createQueryBuilder('plan')
      .where('plan.userId = :userId', { userId: filters.userId });

    if (filters.workoutType) {
      query.andWhere('plan.workoutType = :workoutType', {
        workoutType: filters.workoutType,
      });
    }

    if (filters.search) {
      query.andWhere('plan.name ILIKE :search', {
        search: `%${filters.search}%`,
      });
    }

    const total = await query.getCount();

    const { entities, raw } = await query
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(pe.id)')
          .from(PlanExercise, 'pe')
          .where('pe.planId = plan.id')
          .andWhere('pe.deletedAt IS NULL');
      }, 'exercisesCount')
      .orderBy('plan.updatedAt', 'DESC')
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .getRawAndEntities();

    const items: WorkoutPlanListRow[] = entities.map((plan, index) => {
      const row = raw[index] as { exercisesCount?: string | number };

      return Object.assign(plan, {
        exercisesCount: Number(row.exercisesCount ?? 0),
      });
    });

    return { items, total };
  }

  public async createAggregate(
    data: CreateWorkoutPlanAggregateData,
  ): Promise<WorkoutPlan> {
    return this._dataSource.transaction(async (manager) => {
      const plan = manager.create(WorkoutPlan, {
        userId: data.userId,
        name: data.name,
        notes: data.notes,
        workoutType: data.workoutType,
      });
      const savedPlan = await manager.save(plan);

      await this._insertExercises(manager, savedPlan.id, data.exercises);

      const detail = await manager.findOne(WorkoutPlan, {
        where: { id: savedPlan.id },
        relations: {
          planExercises: {
            exercise: true,
            planSets: true,
          },
        },
        order: {
          planExercises: {
            orderIndex: 'ASC',
            planSets: {
              setNumber: 'ASC',
            },
          },
        },
      });

      if (!detail) {
        throw new WorkoutPlanNotFoundException();
      }

      return detail;
    });
  }

  public async replaceAggregate(
    data: ReplaceWorkoutPlanAggregateData,
  ): Promise<WorkoutPlan> {
    return this._dataSource.transaction(async (manager) => {
      await this._softDeleteExercisesTree(manager, data.planId);

      await manager.update(WorkoutPlan, data.planId, {
        name: data.name,
        notes: data.notes,
        workoutType: data.workoutType,
      });

      await this._insertExercises(manager, data.planId, data.exercises);

      const detail = await manager.findOne(WorkoutPlan, {
        where: { id: data.planId },
        relations: {
          planExercises: {
            exercise: true,
            planSets: true,
          },
        },
        order: {
          planExercises: {
            orderIndex: 'ASC',
            planSets: {
              setNumber: 'ASC',
            },
          },
        },
      });

      if (!detail) {
        throw new WorkoutPlanNotFoundException();
      }

      return detail;
    });
  }

  public async updateMeta(
    plan: WorkoutPlan,
    data: { name?: string; notes?: string | null },
  ): Promise<WorkoutPlan> {
    if (data.name !== undefined) {
      plan.name = data.name;
    }

    if (data.notes !== undefined) {
      plan.notes = data.notes;
    }

    return this._repository.save(plan);
  }

  public async updateWorkoutType(
    planId: string,
    workoutType: WorkoutType,
  ): Promise<WorkoutPlan> {
    await this._repository.update(planId, { workoutType });
    const plan = await this._repository.findOne({ where: { id: planId } });

    if (!plan) {
      throw new WorkoutPlanNotFoundException();
    }

    return plan;
  }

  public async softDeleteTree(planId: string): Promise<void> {
    await this._dataSource.transaction(async (manager) => {
      await this._softDeleteExercisesTree(manager, planId);
      await manager.softDelete(WorkoutPlan, planId);
    });
  }

  public async findMuscleGroupsByPlanId(
    planId: string,
  ): Promise<MuscleGroup[]> {
    const rows = await this._dataSource
      .getRepository(PlanExercise)
      .createQueryBuilder('planExercise')
      .innerJoin('planExercise.exercise', 'exercise')
      .select('DISTINCT exercise.muscleGroup', 'muscleGroup')
      .where('planExercise.planId = :planId', { planId })
      .getRawMany<{ muscleGroup: MuscleGroup }>();

    return rows.map((row) => row.muscleGroup);
  }

  private async _insertExercises(
    manager: EntityManager,
    planId: string,
    exercises: PlanExerciseInput[],
  ): Promise<void> {
    for (const exerciseInput of exercises) {
      const planExercise = manager.create(PlanExercise, {
        planId,
        exerciseId: exerciseInput.exerciseId,
        orderIndex: exerciseInput.orderIndex,
        notes: exerciseInput.notes,
      });
      const savedPlanExercise = await manager.save(planExercise);

      const planSets = exerciseInput.sets.map((setInput) =>
        manager.create(PlanSet, {
          planExerciseId: savedPlanExercise.id,
          setNumber: setInput.setNumber,
          targetReps: setInput.targetReps,
          targetWeightKg: setInput.targetWeightKg,
          targetRestSec: setInput.targetRestSec,
        }),
      );

      if (planSets.length > 0) {
        await manager.save(planSets);
      }
    }
  }

  private async _softDeleteExercisesTree(
    manager: EntityManager,
    planId: string,
  ): Promise<void> {
    const planExercises = await manager.find(PlanExercise, {
      where: { planId },
      select: { id: true },
    });

    if (planExercises.length === 0) {
      return;
    }

    const planExerciseIds = planExercises.map((item) => item.id);

    await manager.softDelete(PlanSet, {
      planExerciseId: In(planExerciseIds),
    });
    await manager.softDelete(PlanExercise, { planId });
  }
}
