import { describe, expect, it } from '@jest/globals';
import {
  hasActualValues,
  resolveSetLogCompletedAtForUpdate,
  resolveSetLogFields,
  setsHaveActuals,
} from '../utils/resolve-set-log-fields.util';

describe('resolve-set-log-fields.util', () => {
  describe('resolveSetLogFields', () => {
    it('sets completedAt to now when both actuals are present', () => {
      const before = Date.now();
      const result = resolveSetLogFields({
        setNumber: 1,
        plannedReps: 8,
        plannedWeightKg: 60,
        actualReps: 8,
        actualWeightKg: 60,
      });
      const after = Date.now();

      expect(result.completedAt).toBeInstanceOf(Date);
      const completedAt = result.completedAt as Date;
      expect(completedAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(completedAt.getTime()).toBeLessThanOrEqual(after);
    });

    it('keeps completedAt null without actuals', () => {
      const result = resolveSetLogFields({
        setNumber: 1,
        plannedReps: 8,
        plannedWeightKg: 60,
      });

      expect(result.actualReps).toBeNull();
      expect(result.actualWeightKg).toBeNull();
      expect(result.completedAt).toBeNull();
    });

    it('uses explicit completedAt when provided', () => {
      const result = resolveSetLogFields({
        setNumber: 1,
        plannedReps: 8,
        plannedWeightKg: 60,
        actualReps: 8,
        actualWeightKg: 60,
        completedAt: '2026-07-19T12:00:00.000Z',
      });

      expect(result.completedAt?.toISOString()).toBe(
        '2026-07-19T12:00:00.000Z',
      );
    });
  });

  describe('resolveSetLogCompletedAtForUpdate', () => {
    it('auto-fills completedAt on first actuals when previously empty', () => {
      const result = resolveSetLogCompletedAtForUpdate({
        actualReps: 8,
        actualWeightKg: 60,
        currentActualReps: null,
        currentActualWeightKg: null,
        currentCompletedAt: null,
      });

      expect(result).toBeInstanceOf(Date);
    });

    it('does not overwrite existing completedAt when actuals change', () => {
      const existing = new Date('2026-07-19T10:00:00.000Z');
      const result = resolveSetLogCompletedAtForUpdate({
        actualReps: 10,
        actualWeightKg: 65,
        currentActualReps: 8,
        currentActualWeightKg: 60,
        currentCompletedAt: existing,
      });

      expect(result).toBeUndefined();
    });
  });

  describe('setsHaveActuals', () => {
    it('detects any set with both actual values', () => {
      expect(hasActualValues(8, 60)).toBe(true);
      expect(hasActualValues(8, null)).toBe(false);
      expect(
        setsHaveActuals([
          { actualReps: null, actualWeightKg: null },
          { actualReps: 8, actualWeightKg: 60 },
        ]),
      ).toBe(true);
    });
  });
});
