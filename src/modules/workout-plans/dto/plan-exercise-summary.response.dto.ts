import { ApiProperty } from '@nestjs/swagger';
import { MuscleGroup } from '@/common/enums';

export class PlanExerciseSummaryResponseDto {
  @ApiProperty()
  public id!: string;

  @ApiProperty({ example: 'Жим штанги лёжа' })
  public name!: string;

  @ApiProperty({ enum: MuscleGroup, example: MuscleGroup.CHEST })
  public muscleGroup!: MuscleGroup;
}
