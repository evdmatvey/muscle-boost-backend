import { describe, expect, it } from '@jest/globals';
import { SessionStatus } from '@/common/enums';
import { resolveInitialSessionStatus } from '../utils/resolve-initial-session-status.util';

describe('resolveInitialSessionStatus', () => {
  it('returns IN_PROGRESS when startNow is true', () => {
    expect(resolveInitialSessionStatus(true, [])).toBe(
      SessionStatus.IN_PROGRESS,
    );
  });

  it('returns IN_PROGRESS when any set has actuals', () => {
    expect(
      resolveInitialSessionStatus(false, [
        [{ actualReps: 8, actualWeightKg: 60 }],
      ]),
    ).toBe(SessionStatus.IN_PROGRESS);
  });

  it('returns PLANNED without startNow and without actuals', () => {
    expect(
      resolveInitialSessionStatus(undefined, [
        [{ actualReps: null, actualWeightKg: null }],
      ]),
    ).toBe(SessionStatus.PLANNED);
  });
});
