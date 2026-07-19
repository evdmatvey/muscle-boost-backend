import { SessionStatus } from '@/common/enums';
import { setsHaveActuals } from './resolve-set-log-fields.util';

export const resolveInitialSessionStatus = (
  startNow: boolean | undefined,
  sets: ReadonlyArray<
    ReadonlyArray<{
      actualReps?: number | null;
      actualWeightKg?: number | null;
    }>
  >,
): SessionStatus => {
  if (startNow) {
    return SessionStatus.IN_PROGRESS;
  }

  const hasActuals = sets.some((exerciseSets) => setsHaveActuals(exerciseSets));

  return hasActuals ? SessionStatus.IN_PROGRESS : SessionStatus.PLANNED;
};
