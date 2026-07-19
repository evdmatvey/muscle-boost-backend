import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@/common/repositories/base.repository';
import { Exercise } from '../entities/exercise.entity';
import { ExerciseSource } from '../enums/exercise-source.enum';
import type {
  CreateExerciseData,
  FindExercisesFilters,
  FindExercisesResult,
  IExercisesRepository,
} from './exercises.repository.interface';

@Injectable()
export class ExercisesRepository
  extends BaseRepository<Exercise>
  implements IExercisesRepository
{
  public constructor(
    @InjectRepository(Exercise)
    repository: Repository<Exercise>,
  ) {
    super(repository);
  }

  public async create(dto: CreateExerciseData): Promise<Exercise> {
    const exercise = this._repository.create({
      name: dto.name,
      description: dto.description,
      muscleGroup: dto.muscleGroup,
      userId: dto.userId,
    });

    return this._repository.save(exercise);
  }

  public async findMany(
    filters: FindExercisesFilters,
  ): Promise<FindExercisesResult> {
    const query = this._repository.createQueryBuilder('exercise');

    if (filters.source === ExerciseSource.CATALOG) {
      query.andWhere('exercise.userId IS NULL');
    } else if (filters.source === ExerciseSource.CUSTOM) {
      query.andWhere('exercise.userId = :userId', { userId: filters.userId });
    } else {
      query.andWhere('(exercise.userId IS NULL OR exercise.userId = :userId)', {
        userId: filters.userId,
      });
    }

    if (filters.muscleGroup) {
      query.andWhere('exercise.muscleGroup = :muscleGroup', {
        muscleGroup: filters.muscleGroup,
      });
    }

    if (filters.search) {
      query.andWhere(
        '(exercise.name ILIKE :search OR exercise.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    query
      .orderBy('exercise.name', 'ASC')
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit);

    const [items, total] = await query.getManyAndCount();

    return { items, total };
  }
}
