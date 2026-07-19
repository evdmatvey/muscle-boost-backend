import { NotFoundDomainException } from '@/common/exceptions';
import { WorkoutSessionsErrorCode } from '../messages/workout-sessions.error-codes';
import { WorkoutSessionsMessages } from '../messages/workout-sessions.messages';

export class WorkoutSessionNotFoundException extends NotFoundDomainException {
  public constructor() {
    super(
      WorkoutSessionsErrorCode.WORKOUT_SESSION_NOT_FOUND,
      WorkoutSessionsMessages[
        WorkoutSessionsErrorCode.WORKOUT_SESSION_NOT_FOUND
      ],
    );
  }
}
