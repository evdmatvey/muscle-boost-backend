import { type BaseEntity } from '../entities';

export interface IBaseRepository<T extends BaseEntity> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
}
