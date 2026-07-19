import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '@/common/dto';
import { WorkoutSessionListItemResponseDto } from './workout-session-list-item.response.dto';

export class PaginatedWorkoutSessionsResponseDto {
  @ApiProperty({ type: [WorkoutSessionListItemResponseDto] })
  public data!: WorkoutSessionListItemResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  public meta!: PaginationMetaDto;
}
