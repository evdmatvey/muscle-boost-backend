import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { PlanExercise } from '../../plan-exercise/entities/plan-exercise.entity';

@Entity('plan_sets')
export class PlanSet extends BaseEntity {
  @Column({ type: 'uuid' })
  public planExerciseId!: string;

  @Column({ type: 'int' })
  public setNumber!: number;

  @Column({ type: 'int' })
  public targetReps!: number;

  @Column({
    type: 'numeric',
    precision: 6,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string | null) =>
        value === null ? 0 : Number.parseFloat(value),
    },
  })
  public targetWeightKg!: number;

  @Column({ type: 'int' })
  public targetRestSec!: number;

  @ManyToOne(() => PlanExercise, (planExercise) => planExercise.planSets)
  @JoinColumn({ name: 'plan_exercise_id' })
  public planExercise?: PlanExercise;
}
