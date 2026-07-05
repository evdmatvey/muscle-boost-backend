import type { FindOptionsWhere, Repository } from 'typeorm';
import type { BaseEntity } from '../entities/base.entity';

export abstract class BaseRepository<T extends BaseEntity> {
  protected constructor(protected readonly _repository: Repository<T>) {}

  public async findById(id: string): Promise<T | null> {
    return this._repository.findOne({
      where: { id } as FindOptionsWhere<T>,
    });
  }

  public async save(entity: T): Promise<T> {
    return this._repository.save(entity);
  }

  public async softDelete(id: string): Promise<void> {
    await this._repository.softDelete(id);
  }

  public async restore(id: string): Promise<void> {
    await this._repository.restore(id);
  }
}
