export interface IBaseRepository<T> {
  create(item: Partial<T>): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  findById(id: string): Promise<T | null>;
  findOne(filter: any): Promise<T | null>;
}
