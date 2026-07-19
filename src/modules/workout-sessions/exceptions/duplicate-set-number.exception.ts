import { ValidationDomainException } from '@/common/exceptions';
import { WorkoutSessionsErrorCode } from '../messages/workout-sessions.error-codes';
import { WorkoutSessionsMessages } from '../messages/workout-sessions.messages';

export class DuplicateSetNumberException extends ValidationDomainException {
  public constructor() {
    super(
      WorkoutSessionsErrorCode.DUPLICATE_SET_NUMBER,
      WorkoutSessionsMessages[WorkoutSessionsErrorCode.DUPLICATE_SET_NUMBER],
    );
  }
}
