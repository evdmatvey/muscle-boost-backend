import type { SetLogInput } from '../types/session-aggregate.types';

export type SetLogFieldsInput = {
  setNumber: number;
  plannedReps: number;
  plannedWeightKg: number;
  actualReps?: number | null;
  actualWeightKg?: number | null;
  rpe?: number | null;
  isWarmup?: boolean;
  completedAt?: string | null;
};

export type SetLogUpdateCompletedAtInput = {
  actualReps?: number | null;
  actualWeightKg?: number | null;
  completedAt?: string | null;
  currentActualReps: number | null;
  currentActualWeightKg: number | null;
  currentCompletedAt: Date | null;
};

export const hasActualValues = (
  actualReps: number | null,
  actualWeightKg: number | null,
): boolean => {
  return actualReps !== null && actualWeightKg !== null;
};

export const setsHaveActuals = (
  sets: ReadonlyArray<{
    actualReps?: number | null;
    actualWeightKg?: number | null;
  }>,
): boolean => {
  return sets.some((set) =>
    hasActualValues(set.actualReps ?? null, set.actualWeightKg ?? null),
  );
};

export const resolveSetLogFields = (input: SetLogFieldsInput): SetLogInput => {
  const actualReps = input.actualReps ?? null;
  const actualWeightKg = input.actualWeightKg ?? null;
  const hasActuals = hasActualValues(actualReps, actualWeightKg);

  let completedAt: Date | null = null;

  if (input.completedAt !== undefined && input.completedAt !== null) {
    completedAt = new Date(input.completedAt);
  } else if (hasActuals) {
    completedAt = new Date();
  }

  return {
    setNumber: input.setNumber,
    plannedReps: input.plannedReps,
    plannedWeightKg: input.plannedWeightKg,
    actualReps,
    actualWeightKg,
    rpe: input.rpe ?? null,
    isWarmup: input.isWarmup ?? false,
    completedAt,
  };
};

export const resolveSetLogCompletedAtForUpdate = (
  input: SetLogUpdateCompletedAtInput,
): Date | null | undefined => {
  if (input.completedAt !== undefined) {
    return input.completedAt === null ? null : new Date(input.completedAt);
  }

  const nextActualReps =
    input.actualReps !== undefined ? input.actualReps : input.currentActualReps;
  const nextActualWeightKg =
    input.actualWeightKg !== undefined
      ? input.actualWeightKg
      : input.currentActualWeightKg;

  const actualsChanged =
    input.actualReps !== undefined || input.actualWeightKg !== undefined;

  if (
    actualsChanged &&
    hasActualValues(nextActualReps, nextActualWeightKg) &&
    input.currentCompletedAt === null
  ) {
    return new Date();
  }

  return undefined;
};
