import { ValidationDomainException } from '@/common/exceptions';
import { WorkoutSessionsErrorCode } from '../messages/workout-sessions.error-codes';
import { WorkoutSessionsMessages } from '../messages/workout-sessions.messages';

export class DuplicateOrderIndexException extends ValidationDomainException {
  public constructor() {
    super(
      WorkoutSessionsErrorCode.DUPLICATE_ORDER_INDEX,
      WorkoutSessionsMessages[WorkoutSessionsErrorCode.DUPLICATE_ORDER_INDEX],
    );
  }
}
