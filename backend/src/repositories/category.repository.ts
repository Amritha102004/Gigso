import { CategoryModel } from "../models/category.model";
import type { ICategory } from "../interfaces/gig.interface";
import type { ICategoryRepository } from "../interfaces/repositories/gig.repository.interface";
import { BaseRepository } from "./base.repository";

export class CategoryRepository extends BaseRepository<ICategory> implements ICategoryRepository {
  constructor() {
    super(CategoryModel);
  }

  async findAll(): Promise<ICategory[]> {
    return await this._model.find().sort({ createdAt: -1 }).exec();
  }

  async findCategories(
    filter: Record<string, unknown>,
    skip: number,
    limit: number
  ): Promise<{ categories: ICategory[]; total: number }> {
    const [categories, total] = await Promise.all([
      this._model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this._model.countDocuments(filter).exec(),
    ]);
    return { categories, total };
  }
}
