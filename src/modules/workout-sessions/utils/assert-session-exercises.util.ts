import {
  type Exercise,
  ExerciseNotFoundException,
  type ExercisesService,
} from '@/modules/exercises';
import { DuplicateOrderIndexException } from '../exceptions/duplicate-order-index.exception';
import { DuplicateSetNumberException } from '../exceptions/duplicate-set-number.exception';
import { ExerciseNotAccessibleException } from '../exceptions/exercise-not-accessible.exception';

type ExercisesAccessService = Pick<ExercisesService, 'findAccessibleByIds'>;

export const assertUniqueOrderIndexes = (
  exercises: ReadonlyArray<{ orderIndex: number }>,
): void => {
  const orderIndexes = exercises.map((exercise) => exercise.orderIndex);

  if (new Set(orderIndexes).size !== orderIndexes.length) {
    throw new DuplicateOrderIndexException();
  }
};

export const assertUniqueSetNumbers = (
  sets: ReadonlyArray<{ setNumber: number }>,
): void => {
  const setNumbers = sets.map((set) => set.setNumber);

  if (new Set(setNumbers).size !== setNumbers.length) {
    throw new DuplicateSetNumberException();
  }
};

export const assertUniqueSetNumbersPerExercise = (
  exercises: ReadonlyArray<{ sets: ReadonlyArray<{ setNumber: number }> }>,
): void => {
  for (const exercise of exercises) {
    assertUniqueSetNumbers(exercise.sets);
  }
};

export const assertExercisesAccessible = async (
  exercisesService: ExercisesAccessService,
  userId: string,
  exerciseIds: readonly string[],
): Promise<Exercise[]> => {
  try {
    return await exercisesService.findAccessibleByIds(userId, [...exerciseIds]);
  } catch (error) {
    if (error instanceof ExerciseNotFoundException) {
      throw new ExerciseNotAccessibleException();
    }

    throw error;
  }
};
