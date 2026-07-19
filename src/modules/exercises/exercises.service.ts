import { Inject, Injectable } from '@nestjs/common';
import type { MuscleGroup } from '@/common/enums';
import type { Exercise } from './entities/exercise.entity';
import type { ExerciseSource } from './enums/exercise-source.enum';
import { ExerciseNotFoundException } from './exceptions/exercise-not-found.exception';
import {
  EXERCISES_REPOSITORY,
  type FindExercisesResult,
  type IExercisesRepository,
} from './repositories/exercises.repository.interface';

export type ListExercisesParams = {
  muscleGroup?: MuscleGroup;
  source: ExerciseSource;
  search?: string;
  page: number;
  limit: number;
};

export type CreateExerciseParams = {
  name: string;
  description: string;
  muscleGroup: MuscleGroup;
};

@Injectable()
export class ExercisesService {
  public constructor(
    @Inject(EXERCISES_REPOSITORY)
    private readonly _exercisesRepository: IExercisesRepository,
  ) {}

  public async list(
    userId: string,
    params: ListExercisesParams,
  ): Promise<FindExercisesResult> {
    return this._exercisesRepository.findMany({
      userId,
      muscleGroup: params.muscleGroup,
      source: params.source,
      search: params.search,
      page: params.page,
      limit: params.limit,
    });
  }

  public async create(
    userId: string,
    params: CreateExerciseParams,
  ): Promise<Exercise> {
    return this._exercisesRepository.create({
      name: params.name,
      description: params.description,
      muscleGroup: params.muscleGroup,
      userId,
    });
  }

  public async findById(id: string): Promise<Exercise> {
    const exercise = await this._exercisesRepository.findById(id);

    if (!exercise) {
      throw new ExerciseNotFoundException();
    }

    return exercise;
  }
}
