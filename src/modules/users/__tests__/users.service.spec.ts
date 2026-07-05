import { Test, type TestingModule } from '@nestjs/testing';
import { type User } from '../entities/user.entity';
import { EmailAlreadyInUseException } from '../exceptions/email-already-in-use.exception';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';
import { type CreateUserCommand } from '../interfaces/create-user.command';
import {
  type IUsersRepository,
  USERS_REPOSITORY,
} from '../repositories/users.repository.interface';
import { UsersService } from '../users.service';

const createUserFixture = (overrides: Partial<User> = {}): User => ({
  id: 'user-id',
  email: 'test@example.com',
  passwordHash: 'hashed-password',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  deletedAt: null,
  ...overrides,
});

const createUserCommandFixture = (
  overrides: Partial<CreateUserCommand> = {},
): CreateUserCommand => ({
  email: 'test@example.com',
  passwordHash: 'hashed-password',
  ...overrides,
});

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: jest.Mocked<
    Pick<
      IUsersRepository,
      'create' | 'findByEmail' | 'findById' | 'existsByEmail'
    >
  >;

  beforeEach(async () => {
    usersRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      existsByEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: USERS_REPOSITORY,
          useValue: usersRepository,
        },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  describe('create', () => {
    it('creates user when email is not taken', async () => {
      const command = createUserCommandFixture();
      const user = createUserFixture();

      usersRepository.existsByEmail.mockResolvedValue(false);
      usersRepository.create.mockResolvedValue(user);

      await expect(service.create(command)).resolves.toBe(user);

      expect(usersRepository.existsByEmail).toHaveBeenCalledWith(command.email);
      expect(usersRepository.create).toHaveBeenCalledWith(command);
    });

    it('throws EmailAlreadyInUseException when email is taken', async () => {
      const command = createUserCommandFixture();

      usersRepository.existsByEmail.mockResolvedValue(true);

      await expect(service.create(command)).rejects.toThrow(
        EmailAlreadyInUseException,
      );

      expect(usersRepository.existsByEmail).toHaveBeenCalledWith(command.email);
      expect(usersRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getByEmail', () => {
    it('returns user when found', async () => {
      const user = createUserFixture();

      usersRepository.findByEmail.mockResolvedValue(user);

      await expect(service.getByEmail(user.email)).resolves.toBe(user);

      expect(usersRepository.findByEmail).toHaveBeenCalledWith(user.email);
    });

    it('throws UserNotFoundException when user is not found', async () => {
      const email = 'missing@example.com';

      usersRepository.findByEmail.mockResolvedValue(null);

      await expect(service.getByEmail(email)).rejects.toThrow(
        UserNotFoundException,
      );

      expect(usersRepository.findByEmail).toHaveBeenCalledWith(email);
    });
  });

  describe('getById', () => {
    it('returns user when found', async () => {
      const user = createUserFixture();

      usersRepository.findById.mockResolvedValue(user);

      await expect(service.getById(user.id)).resolves.toBe(user);

      expect(usersRepository.findById).toHaveBeenCalledWith(user.id);
    });

    it('throws UserNotFoundException when user is not found', async () => {
      const id = 'missing-user-id';

      usersRepository.findById.mockResolvedValue(null);

      await expect(service.getById(id)).rejects.toThrow(UserNotFoundException);

      expect(usersRepository.findById).toHaveBeenCalledWith(id);
    });
  });
});
