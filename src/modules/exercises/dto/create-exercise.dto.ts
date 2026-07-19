import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MaxLength } from 'class-validator';
import { MuscleGroup } from '@/common/enums';
import { ExercisesValidationMessages } from '../messages/exercises.validation.messages';

export class CreateExerciseDto {
  @ApiProperty({ maxLength: 150, example: 'Жим гантелей лёжа' })
  @IsString({ message: ExercisesValidationMessages.NAME_REQUIRED })
  @MaxLength(150, { message: ExercisesValidationMessages.NAME_TOO_LONG })
  public name!: string;

  @ApiProperty({
    maxLength: 2000,
    example:
      'Многосуставное упражнение для грудных мышц, позволяющее увеличить амплитуду движения.',
  })
  @IsString({ message: ExercisesValidationMessages.DESCRIPTION_REQUIRED })
  @MaxLength(2000, {
    message: ExercisesValidationMessages.DESCRIPTION_TOO_LONG,
  })
  public description!: string;

  @ApiProperty({ enum: MuscleGroup, example: MuscleGroup.CHEST })
  @IsEnum(MuscleGroup, {
    message: ExercisesValidationMessages.MUSCLE_GROUP_INVALID,
  })
  public muscleGroup!: MuscleGroup;
}
