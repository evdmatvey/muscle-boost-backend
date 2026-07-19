import { ValidationDomainException } from '@/common/exceptions';
import { WorkoutPlansErrorCode } from '../messages/workout-plans.error-codes';
import { WorkoutPlansMessages } from '../messages/workout-plans.messages';

export class DuplicateSetNumberException extends ValidationDomainException {
  public constructor() {
    super(
      WorkoutPlansErrorCode.DUPLICATE_SET_NUMBER,
      WorkoutPlansMessages[WorkoutPlansErrorCode.DUPLICATE_SET_NUMBER],
    );
  }
}
