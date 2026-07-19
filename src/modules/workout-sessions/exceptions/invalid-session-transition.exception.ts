import { ValidationDomainException } from '@/common/exceptions';
import { WorkoutSessionsErrorCode } from '../messages/workout-sessions.error-codes';
import { WorkoutSessionsMessages } from '../messages/workout-sessions.messages';

export class InvalidSessionTransitionException extends ValidationDomainException {
  public constructor() {
    super(
      WorkoutSessionsErrorCode.INVALID_SESSION_TRANSITION,
      WorkoutSessionsMessages[
        WorkoutSessionsErrorCode.INVALID_SESSION_TRANSITION
      ],
    );
  }
}
