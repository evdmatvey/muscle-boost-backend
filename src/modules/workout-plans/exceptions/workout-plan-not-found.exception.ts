import { NotFoundDomainException } from '@/common/exceptions';
import { WorkoutPlansErrorCode } from '../messages/workout-plans.error-codes';
import { WorkoutPlansMessages } from '../messages/workout-plans.messages';

export class WorkoutPlanNotFoundException extends NotFoundDomainException {
  public constructor() {
    super(
      WorkoutPlansErrorCode.WORKOUT_PLAN_NOT_FOUND,
      WorkoutPlansMessages[WorkoutPlansErrorCode.WORKOUT_PLAN_NOT_FOUND],
    );
  }
}
