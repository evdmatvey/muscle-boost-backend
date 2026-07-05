import { type IBaseRepository } from '@/common/repositories';
import type { User } from '../entities/user.entity';

export type CreateUserData = Pick<User, 'email' | 'passwordHash'>;

export interface IUsersRepository extends IBaseRepository<User> {
  create(dto: CreateUserData): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  existsByEmail(email: string): Promise<boolean>;
}

export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');
