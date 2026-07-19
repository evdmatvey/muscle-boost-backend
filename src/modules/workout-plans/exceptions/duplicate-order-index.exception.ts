import { ValidationDomainException } from '@/common/exceptions';
import { WorkoutPlansErrorCode } from '../messages/workout-plans.error-codes';
import { WorkoutPlansMessages } from '../messages/workout-plans.messages';

export class DuplicateOrderIndexException extends ValidationDomainException {
  public constructor() {
    super(
      WorkoutPlansErrorCode.DUPLICATE_ORDER_INDEX,
      WorkoutPlansMessages[WorkoutPlansErrorCode.DUPLICATE_ORDER_INDEX],
    );
  }
}
