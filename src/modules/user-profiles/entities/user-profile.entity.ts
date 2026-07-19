import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { User } from '@/modules/users';

@Entity('user_profiles')
export class UserProfile extends BaseEntity {
  @Column()
  public userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  public user?: User;

  @Column({ type: 'varchar', length: 100, nullable: true })
  public displayName!: string | null;
}
