import { NotFoundDomainException } from '@/common/exceptions';
import { ExercisesErrorCode } from '../messages/exercises.error-codes';
import { ExercisesMessages } from '../messages/exercises.messages';

export class ExerciseNotFoundException extends NotFoundDomainException {
  public constructor() {
    super(
      ExercisesErrorCode.EXERCISE_NOT_FOUND,
      ExercisesMessages[ExercisesErrorCode.EXERCISE_NOT_FOUND],
    );
  }
}
