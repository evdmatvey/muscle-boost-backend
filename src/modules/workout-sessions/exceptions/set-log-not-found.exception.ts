import { NotFoundDomainException } from '@/common/exceptions';
import { WorkoutSessionsErrorCode } from '../messages/workout-sessions.error-codes';
import { WorkoutSessionsMessages } from '../messages/workout-sessions.messages';

export class SetLogNotFoundException extends NotFoundDomainException {
  public constructor() {
    super(
      WorkoutSessionsErrorCode.SET_LOG_NOT_FOUND,
      WorkoutSessionsMessages[WorkoutSessionsErrorCode.SET_LOG_NOT_FOUND],
    );
  }
}
