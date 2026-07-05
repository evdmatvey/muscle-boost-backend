import { Inject, Injectable } from '@nestjs/common';
import { type User } from './entities/user.entity';
import { EmailAlreadyInUseException } from './exceptions/email-already-in-use.exception';
import { UserNotFoundException } from './exceptions/user-not-found.exception';
import { type CreateUserCommand } from './interfaces/create-user.command';
import {
  type IUsersRepository,
  USERS_REPOSITORY,
} from './repositories/users.repository.interface';

@Injectable()
export class UsersService {
  public constructor(
    @Inject(USERS_REPOSITORY)
    private readonly _usersRepository: IUsersRepository,
  ) {}

  public async create(command: CreateUserCommand): Promise<User> {
    const isAlreadyExists = await this._usersRepository.existsByEmail(
      command.email,
    );

    if (isAlreadyExists) {
      throw new EmailAlreadyInUseException();
    }

    return this._usersRepository.create(command);
  }

  public async getByEmail(email: string): Promise<User> {
    const user = await this._usersRepository.findByEmail(email);

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  public async getById(id: string): Promise<User> {
    const user = await this._usersRepository.findById(id);

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  public async existsByEmail(email: string): Promise<boolean> {
    return this._usersRepository.existsByEmail(email);
  }
}
