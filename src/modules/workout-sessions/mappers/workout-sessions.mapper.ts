import type { SessionExerciseResponseDto } from '../dto/session-exercise.response.dto';
import type { SetLogResponseDto } from '../dto/set-log.response.dto';
import type { WorkoutSessionDetailResponseDto } from '../dto/workout-session-detail.response.dto';
import type { WorkoutSessionListItemResponseDto } from '../dto/workout-session-list-item.response.dto';
import type { WorkoutSession } from '../entities/workout-session.entity';
import type { WorkoutSessionListRow } from '../repositories/workout-sessions.repository.interface';
import type { SessionExercise } from '../submodules/session-exercise/entities/session-exercise.entity';
import type { SetLog } from '../submodules/set-log/entities/set-log.entity';

export const toSetLogResponse = (setLog: SetLog): SetLogResponseDto => {
  return {
    id: setLog.id,
    setNumber: setLog.setNumber,
    plannedReps: setLog.plannedReps,
    plannedWeightKg: setLog.plannedWeightKg,
    actualReps: setLog.actualReps,
    actualWeightKg: setLog.actualWeightKg,
    rpe: setLog.rpe,
    isWarmup: setLog.isWarmup,
    completedAt: setLog.completedAt ? setLog.completedAt.toISOString() : null,
    createdAt: setLog.createdAt.toISOString(),
    updatedAt: setLog.updatedAt.toISOString(),
  };
};

export const toSessionExerciseResponse = (
  sessionExercise: SessionExercise,
): SessionExerciseResponseDto => {
  const exercise = sessionExercise.exercise;

  if (!exercise) {
    throw new Error('Session exercise must include exercise relation');
  }

  return {
    id: sessionExercise.id,
    orderIndex: sessionExercise.orderIndex,
    isSkipped: sessionExercise.isSkipped,
    exercise: {
      id: exercise.id,
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
    },
    sets: (sessionExercise.setLogs ?? [])
      .slice()
      .sort((left, right) => left.setNumber - right.setNumber)
      .map(toSetLogResponse),
    createdAt: sessionExercise.createdAt.toISOString(),
    updatedAt: sessionExercise.updatedAt.toISOString(),
  };
};

export const toWorkoutSessionListItemResponse = (
  session: WorkoutSessionListRow,
): WorkoutSessionListItemResponseDto => {
  return {
    id: session.id,
    planId: session.planId,
    startedAt: session.startedAt.toISOString(),
    completedAt: session.completedAt ? session.completedAt.toISOString() : null,
    status: session.status,
    workoutType: session.workoutType,
    exercisesCount: session.exercisesCount,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  };
};

export const toWorkoutSessionDetailResponse = (
  session: WorkoutSession,
): WorkoutSessionDetailResponseDto => {
  return {
    id: session.id,
    planId: session.planId,
    startedAt: session.startedAt.toISOString(),
    completedAt: session.completedAt ? session.completedAt.toISOString() : null,
    status: session.status,
    workoutType: session.workoutType,
    exercises: (session.sessionExercises ?? [])
      .slice()
      .sort((left, right) => left.orderIndex - right.orderIndex)
      .map(toSessionExerciseResponse),
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  };
};
