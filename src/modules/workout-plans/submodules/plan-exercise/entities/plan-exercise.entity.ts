import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { Exercise } from '@/modules/exercises';
import { WorkoutPlan } from '../../../entities/workout-plan.entity';
import { PlanSet } from '../../plan-set/entities/plan-set.entity';

@Entity('plan_exercises')
export class PlanExercise extends BaseEntity {
  @Column({ type: 'uuid' })
  public planId!: string;

  @Column({ type: 'uuid' })
  public exerciseId!: string;

  @Column({ type: 'int' })
  public orderIndex!: number;

  @Column({ type: 'text', nullable: true })
  public notes!: string | null;

  @ManyToOne(() => WorkoutPlan, (plan) => plan.planExercises)
  @JoinColumn({ name: 'plan_id' })
  public plan?: WorkoutPlan;

  @ManyToOne(() => Exercise)
  @JoinColumn({ name: 'exercise_id' })
  public exercise?: Exercise;

  @OneToMany(() => PlanSet, (planSet) => planSet.planExercise)
  public planSets?: PlanSet[];
}
