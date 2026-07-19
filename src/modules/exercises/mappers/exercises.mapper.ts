import type { ExerciseResponseDto } from '../dto/exercise.response.dto';
import type { Exercise } from '../entities/exercise.entity';

export const toExerciseResponse = (exercise: Exercise): ExerciseResponseDto => {
  return {
    id: exercise.id,
    name: exercise.name,
    description: exercise.description,
    muscleGroup: exercise.muscleGroup,
    isCustom: exercise.userId !== null,
    createdAt: exercise.createdAt.toISOString(),
    updatedAt: exercise.updatedAt.toISOString(),
  };
};
