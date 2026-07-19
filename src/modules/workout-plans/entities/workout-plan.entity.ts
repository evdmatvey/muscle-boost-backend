import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { WorkoutType } from '@/common/enums';
import { User } from '@/modules/users';
import { PlanExercise } from '../submodules/plan-exercise/entities/plan-exercise.entity';

@Entity('workout_plans')
export class WorkoutPlan extends BaseEntity {
  @Column({ type: 'uuid' })
  public userId!: string;

  @Column({ type: 'varchar', length: 150 })
  public name!: string;

  @Column({ type: 'text', nullable: true })
  public notes!: string | null;

  @Column({
    type: 'enum',
    enum: WorkoutType,
    enumName: 'workout_type',
  })
  public workoutType!: WorkoutType;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  public user?: User;

  @OneToMany(() => PlanExercise, (planExercise) => planExercise.plan)
  public planExercises?: PlanExercise[];
}
