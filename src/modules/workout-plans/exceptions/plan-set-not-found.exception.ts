import { NotFoundDomainException } from '@/common/exceptions';
import { WorkoutPlansErrorCode } from '../messages/workout-plans.error-codes';
import { WorkoutPlansMessages } from '../messages/workout-plans.messages';

export class PlanSetNotFoundException extends NotFoundDomainException {
  public constructor() {
    super(
      WorkoutPlansErrorCode.PLAN_SET_NOT_FOUND,
      WorkoutPlansMessages[WorkoutPlansErrorCode.PLAN_SET_NOT_FOUND],
    );
  }
}
