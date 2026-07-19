export type SetLogInput = {
  setNumber: number;
  plannedReps: number;
  plannedWeightKg: number;
  actualReps: number | null;
  actualWeightKg: number | null;
  rpe: number | null;
  isWarmup: boolean;
  completedAt: Date | null;
};

export type SessionExerciseInput = {
  exerciseId: string;
  orderIndex: number;
  isSkipped: boolean;
  sets: SetLogInput[];
};
