import { NotFoundDomainException } from '@/common/exceptions';
import { WorkoutSessionsErrorCode } from '../messages/workout-sessions.error-codes';
import { WorkoutSessionsMessages } from '../messages/workout-sessions.messages';

export class ExerciseNotAccessibleException extends NotFoundDomainException {
  public constructor() {
    super(
      WorkoutSessionsErrorCode.EXERCISE_NOT_ACCESSIBLE,
      WorkoutSessionsMessages[WorkoutSessionsErrorCode.EXERCISE_NOT_ACCESSIBLE],
    );
  }
}
