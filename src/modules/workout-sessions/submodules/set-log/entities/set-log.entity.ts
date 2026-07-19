import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { SessionExercise } from '../../session-exercise/entities/session-exercise.entity';

@Entity('set_logs')
export class SetLog extends BaseEntity {
  @Column({ type: 'uuid' })
  public sessionExerciseId!: string;

  @Column({ type: 'int' })
  public setNumber!: number;

  @Column({ type: 'int' })
  public plannedReps!: number;

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
  public plannedWeightKg!: number;

  @Column({ type: 'int', nullable: true })
  public actualReps!: number | null;

  @Column({
    type: 'numeric',
    precision: 6,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) =>
        value === null ? null : Number.parseFloat(value),
    },
  })
  public actualWeightKg!: number | null;

  @Column({
    type: 'numeric',
    precision: 3,
    scale: 1,
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) =>
        value === null ? null : Number.parseFloat(value),
    },
  })
  public rpe!: number | null;

  @Column({ type: 'boolean', default: false })
  public isWarmup!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  public completedAt!: Date | null;

  @ManyToOne(
    () => SessionExercise,
    (sessionExercise) => sessionExercise.setLogs,
  )
  @JoinColumn({ name: 'session_exercise_id' })
  public sessionExercise?: SessionExercise;
}
