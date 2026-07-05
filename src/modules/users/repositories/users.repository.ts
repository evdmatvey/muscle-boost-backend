import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@/common/repositories/base.repository';
import { User } from '../entities/user.entity';
import type {
  CreateUserData,
  IUsersRepository,
} from './users.repository.interface';

@Injectable()
export class UsersRepository
  extends BaseRepository<User>
  implements IUsersRepository
{
  public constructor(
    @InjectRepository(User)
    repository: Repository<User>,
  ) {
    super(repository);
  }

  public async create(dto: CreateUserData): Promise<User> {
    const user = this._repository.create({
      email: dto.email,
      passwordHash: dto.passwordHash,
    });

    return this._repository.save(user);
  }

  public async findByEmail(email: string): Promise<User | null> {
    return this._repository.findOne({ where: { email } });
  }

  public async existsByEmail(email: string): Promise<boolean> {
    return this._repository.exists({ where: { email } });
  }
}
