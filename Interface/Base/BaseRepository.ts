export interface IBaseRepository<T> {
    create(data: Partial<T>): Promise<T>;
    findOneById(id: string): Promise<T | null>;
    findAllData(): Promise<T[]>;
    updateOneById(id: string, data: Partial<T>): Promise<T | null>;
    deleteOneById(id: string): Promise<any>;
  }