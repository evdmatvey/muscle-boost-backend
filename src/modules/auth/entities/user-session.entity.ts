import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { User } from '@/modules/users';

@Entity('user_sessions')
export class UserSession extends BaseEntity {
  @Column()
  public userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  public user?: User;

  @Column()
  public refreshTokenHash!: string;

  @Column()
  public deviceName!: string;

  @Column({ type: 'timestamptz' })
  public lastOnline!: Date;

  @Column({ type: 'timestamptz' })
  public expiresAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  public revokedAt!: Date | null;
}
