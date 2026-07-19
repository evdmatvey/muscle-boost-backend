import { MuscleGroup, WorkoutType } from '@/common/enums';

const ACCESSORY_GROUPS = new Set<MuscleGroup>([
  MuscleGroup.ABS,
  MuscleGroup.FOREARMS,
]);

const LOWER_GROUPS = new Set<MuscleGroup>([
  MuscleGroup.LEGS,
  MuscleGroup.CALVES,
  MuscleGroup.GLUTES,
]);

const PUSH_GROUPS = new Set<MuscleGroup>([
  MuscleGroup.CHEST,
  MuscleGroup.SHOULDERS,
  MuscleGroup.TRICEPS,
]);

const PULL_GROUPS = new Set<MuscleGroup>([
  MuscleGroup.BACK,
  MuscleGroup.BICEPS,
]);

const UPPER_GROUPS = new Set<MuscleGroup>([
  MuscleGroup.CHEST,
  MuscleGroup.BACK,
  MuscleGroup.SHOULDERS,
  MuscleGroup.BICEPS,
  MuscleGroup.TRICEPS,
  MuscleGroup.ARMS,
]);

const SINGLE_GROUP_TO_WORKOUT_TYPE: Record<MuscleGroup, WorkoutType> = {
  [MuscleGroup.LEGS]: WorkoutType.LEGS,
  [MuscleGroup.ARMS]: WorkoutType.ARMS,
  [MuscleGroup.CHEST]: WorkoutType.CHEST,
  [MuscleGroup.BACK]: WorkoutType.BACK,
  [MuscleGroup.SHOULDERS]: WorkoutType.SHOULDERS,
  [MuscleGroup.BICEPS]: WorkoutType.BICEPS,
  [MuscleGroup.TRICEPS]: WorkoutType.TRICEPS,
  [MuscleGroup.ABS]: WorkoutType.ABS,
  [MuscleGroup.FOREARMS]: WorkoutType.FOREARMS,
  [MuscleGroup.CALVES]: WorkoutType.CALVES,
  [MuscleGroup.GLUTES]: WorkoutType.GLUTES,
};

const EXACT_COMBINATIONS: ReadonlyArray<{
  groups: ReadonlySet<MuscleGroup>;
  workoutType: WorkoutType;
}> = [
  {
    groups: new Set([MuscleGroup.CHEST, MuscleGroup.BICEPS]),
    workoutType: WorkoutType.CHEST_BICEPS,
  },
  {
    groups: new Set([MuscleGroup.BACK, MuscleGroup.TRICEPS]),
    workoutType: WorkoutType.BACK_TRICEPS,
  },
  {
    groups: new Set([MuscleGroup.SHOULDERS, MuscleGroup.ARMS]),
    workoutType: WorkoutType.SHOULDERS_ARMS,
  },
  {
    groups: new Set([
      MuscleGroup.SHOULDERS,
      MuscleGroup.BICEPS,
      MuscleGroup.TRICEPS,
    ]),
    workoutType: WorkoutType.SHOULDERS_ARMS,
  },
  {
    groups: new Set([MuscleGroup.LEGS, MuscleGroup.SHOULDERS]),
    workoutType: WorkoutType.LEGS_SHOULDERS,
  },
  {
    groups: new Set([MuscleGroup.CHEST, MuscleGroup.BACK]),
    workoutType: WorkoutType.CHEST_BACK,
  },
  {
    groups: new Set([MuscleGroup.BICEPS, MuscleGroup.TRICEPS]),
    workoutType: WorkoutType.BICEPS_TRICEPS,
  },
];

const isSameSet = (
  left: ReadonlySet<MuscleGroup>,
  right: ReadonlySet<MuscleGroup>,
): boolean => {
  if (left.size !== right.size) {
    return false;
  }

  for (const value of left) {
    if (!right.has(value)) {
      return false;
    }
  }

  return true;
};

const isSubset = (
  values: ReadonlySet<MuscleGroup>,
  allowed: ReadonlySet<MuscleGroup>,
): boolean => {
  for (const value of values) {
    if (!allowed.has(value)) {
      return false;
    }
  }

  return true;
};

export const resolveWorkoutType = (
  muscleGroups: readonly MuscleGroup[],
): WorkoutType => {
  const uniqueGroups = new Set(muscleGroups);

  if (uniqueGroups.size === 0) {
    return WorkoutType.FULL_BODY;
  }

  if (uniqueGroups.size === 1) {
    const [group] = Array.from(uniqueGroups);

    if (group) {
      return SINGLE_GROUP_TO_WORKOUT_TYPE[group];
    }
  }

  for (const combination of EXACT_COMBINATIONS) {
    if (isSameSet(uniqueGroups, combination.groups)) {
      return combination.workoutType;
    }
  }

  const primaryGroups = new Set(
    [...uniqueGroups].filter((group) => !ACCESSORY_GROUPS.has(group)),
  );

  if (primaryGroups.size === 0) {
    return WorkoutType.FULL_BODY;
  }

  if (primaryGroups.size === 1) {
    const [group] = Array.from(primaryGroups);

    if (group) {
      return SINGLE_GROUP_TO_WORKOUT_TYPE[group];
    }
  }

  if (isSubset(primaryGroups, LOWER_GROUPS)) {
    return WorkoutType.LOWER_BODY;
  }

  if (isSubset(primaryGroups, PUSH_GROUPS)) {
    return WorkoutType.PUSH;
  }

  if (isSubset(primaryGroups, PULL_GROUPS)) {
    return WorkoutType.PULL;
  }

  if (isSubset(primaryGroups, UPPER_GROUPS)) {
    return WorkoutType.UPPER_BODY;
  }

  return WorkoutType.FULL_BODY;
};
