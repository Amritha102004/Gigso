import type { DbInput } from "../../utils/db-types";

export interface IBaseRepository<T> {
  create(item: DbInput<T>): Promise<T>;
  update(id: string, item: DbInput<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  findById(id: string): Promise<T | null>;
  findOne(filter: Record<string, unknown>): Promise<T | null>;
}
