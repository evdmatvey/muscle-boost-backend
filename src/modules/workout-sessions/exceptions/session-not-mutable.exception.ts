import { ValidationDomainException } from '@/common/exceptions';
import { WorkoutSessionsErrorCode } from '../messages/workout-sessions.error-codes';
import { WorkoutSessionsMessages } from '../messages/workout-sessions.messages';

export class SessionNotMutableException extends ValidationDomainException {
  public constructor() {
    super(
      WorkoutSessionsErrorCode.SESSION_NOT_MUTABLE,
      WorkoutSessionsMessages[WorkoutSessionsErrorCode.SESSION_NOT_MUTABLE],
    );
  }
}
