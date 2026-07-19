import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { MuscleGroup } from '@/common/enums';
import { User } from '@/modules/users';

@Entity('exercises')
export class Exercise extends BaseEntity {
  @Column({ type: 'varchar', length: 150 })
  public name!: string;

  @Column({ type: 'text' })
  public description!: string;

  @Column({
    type: 'enum',
    enum: MuscleGroup,
    enumName: 'muscle_group',
  })
  public muscleGroup!: MuscleGroup;

  @Column({ type: 'uuid', nullable: true })
  public userId!: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  public user?: User | null;
}
