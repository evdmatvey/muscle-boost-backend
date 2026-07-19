import { describe, expect, it } from '@jest/globals';
import { MuscleGroup, WorkoutType } from '@/common/enums';
import { resolveWorkoutType } from '../utils/resolve-workout-type.util';

describe('resolveWorkoutType', () => {
  it('returns FULL_BODY for empty list', () => {
    expect(resolveWorkoutType([])).toBe(WorkoutType.FULL_BODY);
  });

  it('maps a single muscle group to matching workout type', () => {
    expect(resolveWorkoutType([MuscleGroup.CHEST])).toBe(WorkoutType.CHEST);
    expect(resolveWorkoutType([MuscleGroup.LEGS, MuscleGroup.LEGS])).toBe(
      WorkoutType.LEGS,
    );
  });

  it('resolves exact known combinations', () => {
    expect(resolveWorkoutType([MuscleGroup.CHEST, MuscleGroup.BICEPS])).toBe(
      WorkoutType.CHEST_BICEPS,
    );
    expect(resolveWorkoutType([MuscleGroup.BACK, MuscleGroup.TRICEPS])).toBe(
      WorkoutType.BACK_TRICEPS,
    );
    expect(resolveWorkoutType([MuscleGroup.SHOULDERS, MuscleGroup.ARMS])).toBe(
      WorkoutType.SHOULDERS_ARMS,
    );
    expect(
      resolveWorkoutType([
        MuscleGroup.SHOULDERS,
        MuscleGroup.BICEPS,
        MuscleGroup.TRICEPS,
      ]),
    ).toBe(WorkoutType.SHOULDERS_ARMS);
    expect(resolveWorkoutType([MuscleGroup.LEGS, MuscleGroup.SHOULDERS])).toBe(
      WorkoutType.LEGS_SHOULDERS,
    );
    expect(resolveWorkoutType([MuscleGroup.CHEST, MuscleGroup.BACK])).toBe(
      WorkoutType.CHEST_BACK,
    );
    expect(resolveWorkoutType([MuscleGroup.BICEPS, MuscleGroup.TRICEPS])).toBe(
      WorkoutType.BICEPS_TRICEPS,
    );
  });

  it('ignores accessories when classifying broader types', () => {
    expect(resolveWorkoutType([MuscleGroup.CHEST, MuscleGroup.ABS])).toBe(
      WorkoutType.CHEST,
    );
    expect(
      resolveWorkoutType([
        MuscleGroup.CHEST,
        MuscleGroup.SHOULDERS,
        MuscleGroup.TRICEPS,
        MuscleGroup.ABS,
      ]),
    ).toBe(WorkoutType.PUSH);
  });

  it('classifies lower, push, pull, upper and full body', () => {
    expect(
      resolveWorkoutType([
        MuscleGroup.LEGS,
        MuscleGroup.CALVES,
        MuscleGroup.GLUTES,
      ]),
    ).toBe(WorkoutType.LOWER_BODY);
    expect(
      resolveWorkoutType([
        MuscleGroup.CHEST,
        MuscleGroup.SHOULDERS,
        MuscleGroup.TRICEPS,
      ]),
    ).toBe(WorkoutType.PUSH);
    expect(resolveWorkoutType([MuscleGroup.BACK, MuscleGroup.BICEPS])).toBe(
      WorkoutType.PULL,
    );
    expect(
      resolveWorkoutType([
        MuscleGroup.CHEST,
        MuscleGroup.BACK,
        MuscleGroup.SHOULDERS,
      ]),
    ).toBe(WorkoutType.UPPER_BODY);
    expect(resolveWorkoutType([MuscleGroup.LEGS, MuscleGroup.CHEST])).toBe(
      WorkoutType.FULL_BODY,
    );
  });

  it('returns FULL_BODY when only accessories remain', () => {
    expect(resolveWorkoutType([MuscleGroup.ABS, MuscleGroup.FOREARMS])).toBe(
      WorkoutType.FULL_BODY,
    );
  });
});
