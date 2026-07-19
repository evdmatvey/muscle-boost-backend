import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  type User,
  UserNotFoundException,
  UsersService,
} from '@/modules/users';
import { type UserProfile } from '../entities/user-profile.entity';
import {
  type IUserProfilesRepository,
  USER_PROFILES_REPOSITORY,
} from '../repositories/user-profiles.repository.interface';
import { UserProfilesService } from '../user-profiles.service';

const createUserFixture = (overrides: Partial<User> = {}): User => ({
  id: 'user-id',
  email: 'test@example.com',
  passwordHash: 'hashed-password',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  deletedAt: null,
  ...overrides,
});

const createProfileFixture = (
  overrides: Partial<UserProfile> = {},
): UserProfile => ({
  id: 'profile-id',
  userId: 'user-id',
  displayName: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  deletedAt: null,
  ...overrides,
});

describe('UserProfilesService', () => {
  let service: UserProfilesService;
  let userProfilesRepository: jest.Mocked<
    Pick<IUserProfilesRepository, 'create' | 'findByUserId' | 'save'>
  >;
  let usersService: jest.Mocked<Pick<UsersService, 'getById'>>;

  beforeEach(async () => {
    userProfilesRepository = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      save: jest.fn(),
    };

    usersService = {
      getById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserProfilesService,
        {
          provide: USER_PROFILES_REPOSITORY,
          useValue: userProfilesRepository,
        },
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    service = module.get(UserProfilesService);
  });

  describe('createForUser', () => {
    it('creates profile when it does not exist', async () => {
      const profile = createProfileFixture();

      userProfilesRepository.findByUserId.mockResolvedValue(null);
      userProfilesRepository.create.mockResolvedValue(profile);

      await expect(service.createForUser(profile.userId)).resolves.toBe(
        profile,
      );

      expect(userProfilesRepository.findByUserId).toHaveBeenCalledWith(
        profile.userId,
      );
      expect(userProfilesRepository.create).toHaveBeenCalledWith({
        userId: profile.userId,
        displayName: null,
      });
    });

    it('returns existing profile when already created', async () => {
      const profile = createProfileFixture({ displayName: 'John' });

      userProfilesRepository.findByUserId.mockResolvedValue(profile);

      await expect(service.createForUser(profile.userId)).resolves.toBe(
        profile,
      );

      expect(userProfilesRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getMe', () => {
    it('returns profile with email when profile exists', async () => {
      const user = createUserFixture();
      const profile = createProfileFixture({ displayName: 'John' });

      usersService.getById.mockResolvedValue(user);
      userProfilesRepository.findByUserId.mockResolvedValue(profile);

      await expect(service.getMe(user.id)).resolves.toEqual({
        profile,
        email: user.email,
      });

      expect(userProfilesRepository.create).not.toHaveBeenCalled();
    });

    it('creates profile when missing and returns with email', async () => {
      const user = createUserFixture();
      const profile = createProfileFixture();

      usersService.getById.mockResolvedValue(user);
      userProfilesRepository.findByUserId.mockResolvedValue(null);
      userProfilesRepository.create.mockResolvedValue(profile);

      await expect(service.getMe(user.id)).resolves.toEqual({
        profile,
        email: user.email,
      });

      expect(userProfilesRepository.create).toHaveBeenCalledWith({
        userId: user.id,
        displayName: null,
      });
    });

    it('throws UserNotFoundException when user is not found', async () => {
      usersService.getById.mockRejectedValue(new UserNotFoundException());

      await expect(service.getMe('missing-user-id')).rejects.toThrow(
        UserNotFoundException,
      );
    });
  });

  describe('updateMe', () => {
    it('updates displayName and returns profile with email', async () => {
      const user = createUserFixture();
      const profile = createProfileFixture();
      const updatedProfile = createProfileFixture({ displayName: 'John' });

      usersService.getById.mockResolvedValue(user);
      userProfilesRepository.findByUserId.mockResolvedValue(profile);
      userProfilesRepository.save.mockResolvedValue(updatedProfile);

      await expect(service.updateMe(user.id, 'John')).resolves.toEqual({
        profile: updatedProfile,
        email: user.email,
      });

      expect(profile.displayName).toBe('John');
      expect(userProfilesRepository.save).toHaveBeenCalledWith(profile);
    });

    it('allows clearing displayName with null', async () => {
      const user = createUserFixture();
      const profile = createProfileFixture({ displayName: 'John' });
      const updatedProfile = createProfileFixture({ displayName: null });

      usersService.getById.mockResolvedValue(user);
      userProfilesRepository.findByUserId.mockResolvedValue(profile);
      userProfilesRepository.save.mockResolvedValue(updatedProfile);

      await expect(service.updateMe(user.id, null)).resolves.toEqual({
        profile: updatedProfile,
        email: user.email,
      });

      expect(profile.displayName).toBeNull();
    });
  });
});
