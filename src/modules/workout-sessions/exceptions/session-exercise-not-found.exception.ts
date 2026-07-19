import { NotFoundDomainException } from '@/common/exceptions';
import { WorkoutSessionsErrorCode } from '../messages/workout-sessions.error-codes';
import { WorkoutSessionsMessages } from '../messages/workout-sessions.messages';

export class SessionExerciseNotFoundException extends NotFoundDomainException {
  public constructor() {
    super(
      WorkoutSessionsErrorCode.SESSION_EXERCISE_NOT_FOUND,
      WorkoutSessionsMessages[
        WorkoutSessionsErrorCode.SESSION_EXERCISE_NOT_FOUND
      ],
    );
  }
}
