import type { MuscleGroup } from '@/common/enums';
import { type IBaseRepository } from '@/common/repositories';
import type { Exercise } from '../entities/exercise.entity';
import type { ExerciseSource } from '../enums/exercise-source.enum';

export type CreateExerciseData = Pick<
  Exercise,
  'name' | 'description' | 'muscleGroup' | 'userId'
>;

export type FindExercisesFilters = {
  userId: string;
  muscleGroup?: MuscleGroup;
  source: ExerciseSource;
  search?: string;
  page: number;
  limit: number;
};

export type FindExercisesResult = {
  items: Exercise[];
  total: number;
};

export interface IExercisesRepository extends IBaseRepository<Exercise> {
  create(dto: CreateExerciseData): Promise<Exercise>;
  findMany(filters: FindExercisesFilters): Promise<FindExercisesResult>;
}

export const EXERCISES_REPOSITORY = Symbol('EXERCISES_REPOSITORY');
