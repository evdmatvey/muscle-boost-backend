import { ValidationDomainException } from '@/common/exceptions';
import { WorkoutSessionsErrorCode } from '../messages/workout-sessions.error-codes';
import { WorkoutSessionsMessages } from '../messages/workout-sessions.messages';

export class InvalidCreateSessionPayloadException extends ValidationDomainException {
  public constructor() {
    super(
      WorkoutSessionsErrorCode.INVALID_CREATE_SESSION_PAYLOAD,
      WorkoutSessionsMessages[
        WorkoutSessionsErrorCode.INVALID_CREATE_SESSION_PAYLOAD
      ],
    );
  }
}
