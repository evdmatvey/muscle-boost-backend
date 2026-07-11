import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThan, MoreThan, Repository } from 'typeorm';
import { BaseRepository } from '@/common/repositories/base.repository';
import { UserSession } from '../entities/user-session.entity';
import type {
  CreateUserSessionData,
  IUserSessionsRepository,
  RotateRefreshTokenParams,
} from './user-sessions.repository.interface';

@Injectable()
export class UserSessionsRepository
  extends BaseRepository<UserSession>
  implements IUserSessionsRepository
{
  public constructor(
    @InjectRepository(UserSession)
    repository: Repository<UserSession>,
  ) {
    super(repository);
  }

  public async create(data: CreateUserSessionData): Promise<UserSession> {
    const session = this._repository.create(data);

    return this._repository.save(session);
  }

  public async findActiveById(id: string): Promise<UserSession | null> {
    return this._repository.findOne({
      where: {
        id,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
    });
  }

  public async findActiveByUserId(userId: string): Promise<UserSession[]> {
    return this._repository.find({
      where: {
        userId,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      order: {
        lastOnline: 'DESC',
      },
    });
  }

  public async rotateRefreshTokenIfMatches(
    params: RotateRefreshTokenParams,
  ): Promise<boolean> {
    const now = new Date();
    const result = await this._repository.update(
      {
        id: params.sessionId,
        userId: params.userId,
        refreshTokenHash: params.expectedHash,
        revokedAt: IsNull(),
        expiresAt: MoreThan(now),
      },
      {
        refreshTokenHash: params.newHash,
        lastOnline: params.lastOnline,
        expiresAt: params.expiresAt,
      },
    );

    return result.affected === 1;
  }

  public async revokeById(id: string): Promise<void> {
    await this._repository.update(id, { revokedAt: new Date() });
  }

  public async revokeAllExcept(
    userId: string,
    sessionId: string,
  ): Promise<void> {
    await this._repository
      .createQueryBuilder()
      .update(UserSession)
      .set({ revokedAt: new Date() })
      .where('user_id = :userId', { userId })
      .andWhere('id != :sessionId', { sessionId })
      .andWhere('revoked_at IS NULL')
      .andWhere('expires_at > :now', { now: new Date() })
      .execute();
  }

  public async revokeAllByUserId(userId: string): Promise<void> {
    const now = new Date();

    await this._repository
      .createQueryBuilder()
      .update(UserSession)
      .set({ revokedAt: now })
      .where('user_id = :userId', { userId })
      .andWhere('revoked_at IS NULL')
      .andWhere('expires_at > :now', { now })
      .execute();
  }

  public async touchLastOnlineIfStale(
    sessionId: string,
    staleBefore: Date,
  ): Promise<void> {
    const now = new Date();

    await this._repository.update(
      {
        id: sessionId,
        revokedAt: IsNull(),
        expiresAt: MoreThan(now),
        lastOnline: LessThan(staleBefore),
      },
      { lastOnline: now },
    );
  }
}
