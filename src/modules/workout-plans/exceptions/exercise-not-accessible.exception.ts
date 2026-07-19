import { NotFoundDomainException } from '@/common/exceptions';
import { WorkoutPlansErrorCode } from '../messages/workout-plans.error-codes';
import { WorkoutPlansMessages } from '../messages/workout-plans.messages';

export class ExerciseNotAccessibleException extends NotFoundDomainException {
  public constructor() {
    super(
      WorkoutPlansErrorCode.EXERCISE_NOT_ACCESSIBLE,
      WorkoutPlansMessages[WorkoutPlansErrorCode.EXERCISE_NOT_ACCESSIBLE],
    );
  }
}
