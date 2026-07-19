export type PlanSetInput = {
  setNumber: number;
  targetReps: number;
  targetWeightKg: number;
  targetRestSec: number;
};

export type PlanExerciseInput = {
  exerciseId: string;
  orderIndex: number;
  notes: string | null;
  sets: PlanSetInput[];
};
