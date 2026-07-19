import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { Exercise } from '@/modules/exercises';
import { WorkoutSession } from '../../../entities/workout-session.entity';
import { SetLog } from '../../set-log/entities/set-log.entity';

@Entity('session_exercises')
export class SessionExercise extends BaseEntity {
  @Column({ type: 'uuid' })
  public sessionId!: string;

  @Column({ type: 'uuid' })
  public exerciseId!: string;

  @Column({ type: 'int' })
  public orderIndex!: number;

  @Column({ type: 'boolean', default: false })
  public isSkipped!: boolean;

  @ManyToOne(() => WorkoutSession, (session) => session.sessionExercises)
  @JoinColumn({ name: 'session_id' })
  public session?: WorkoutSession;

  @ManyToOne(() => Exercise)
  @JoinColumn({ name: 'exercise_id' })
  public exercise?: Exercise;

  @OneToMany(() => SetLog, (setLog) => setLog.sessionExercise)
  public setLogs?: SetLog[];
}
