import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto';
import { MuscleGroup } from '@/common/enums';
import { ExerciseSource } from '../enums/exercise-source.enum';
import { ExercisesValidationMessages } from '../messages/exercises.validation.messages';

export class ListExercisesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: MuscleGroup })
  @IsOptional()
  @IsEnum(MuscleGroup, {
    message: ExercisesValidationMessages.MUSCLE_GROUP_INVALID,
  })
  public muscleGroup?: MuscleGroup;

  @ApiPropertyOptional({
    enum: ExerciseSource,
    default: ExerciseSource.ALL,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === undefined || value === null || value === ''
      ? ExerciseSource.ALL
      : value,
  )
  @IsEnum(ExerciseSource, {
    message: ExercisesValidationMessages.SOURCE_INVALID,
  })
  public source!: ExerciseSource;

  @ApiPropertyOptional({ maxLength: 100, example: 'жим' })
  @IsOptional()
  @IsString({ message: ExercisesValidationMessages.SEARCH_INVALID })
  @MaxLength(100, { message: ExercisesValidationMessages.SEARCH_TOO_LONG })
  public search?: string;
}
