import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '@/common/dto';
import { WorkoutPlanListItemResponseDto } from './workout-plan-list-item.response.dto';

export class PaginatedWorkoutPlansResponseDto {
  @ApiProperty({ type: [WorkoutPlanListItemResponseDto] })
  public data!: WorkoutPlanListItemResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  public meta!: PaginationMetaDto;
}
