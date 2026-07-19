import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '@/common/dto';
import { ExerciseResponseDto } from './exercise.response.dto';

export class PaginatedExercisesResponseDto {
  @ApiProperty({ type: [ExerciseResponseDto] })
  public data!: ExerciseResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  public meta!: PaginationMetaDto;
}
