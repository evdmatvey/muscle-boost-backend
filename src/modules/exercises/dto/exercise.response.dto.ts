import { ApiProperty } from '@nestjs/swagger';
import { MuscleGroup } from '@/common/enums';

export class ExerciseResponseDto {
  @ApiProperty()
  public id!: string;

  @ApiProperty({ example: 'Жим штанги лёжа' })
  public name!: string;

  @ApiProperty({
    example:
      'Базовое многосуставное упражнение для развития грудных мышц, передних дельт и трицепсов.',
  })
  public description!: string;

  @ApiProperty({ enum: MuscleGroup, example: MuscleGroup.CHEST })
  public muscleGroup!: MuscleGroup;

  @ApiProperty({ example: false })
  public isCustom!: boolean;

  @ApiProperty()
  public createdAt!: string;

  @ApiProperty()
  public updatedAt!: string;
}
