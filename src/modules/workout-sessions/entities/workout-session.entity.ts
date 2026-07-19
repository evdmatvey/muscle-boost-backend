import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { SessionStatus, WorkoutType } from '@/common/enums';
import { User } from '@/modules/users';
import { WorkoutPlan } from '@/modules/workout-plans';
import { SessionExercise } from '../submodules/session-exercise/entities/session-exercise.entity';

@Entity('workout_sessions')
export class WorkoutSession extends BaseEntity {
  @Column({ type: 'uuid' })
  public userId!: string;

  @Column({ type: 'uuid', nullable: true })
  public planId!: string | null;

  @Column({ type: 'timestamptz' })
  public startedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  public completedAt!: Date | null;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    enumName: 'session_status',
  })
  public status!: SessionStatus;

  @Column({
    type: 'enum',
    enum: WorkoutType,
    enumName: 'workout_type',
  })
  public workoutType!: WorkoutType;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  public user?: User;

  @ManyToOne(() => WorkoutPlan, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'plan_id' })
  public plan?: WorkoutPlan | null;

  @OneToMany(
    () => SessionExercise,
    (sessionExercise) => sessionExercise.session,
  )
  public sessionExercises?: SessionExercise[];
}
