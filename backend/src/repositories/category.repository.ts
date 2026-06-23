import { CategoryModel } from "../models/category.model";
import { ICategory } from "../interfaces/gig.interface";
import { ICategoryRepository } from "../interfaces/repositories/gig.repository.interface";
import { BaseRepository } from "./base.repository";

export class CategoryRepository extends BaseRepository<ICategory> implements ICategoryRepository {
  constructor() {
    super(CategoryModel);
  }

  async findAll(): Promise<ICategory[]> {
    return await CategoryModel.find().sort({ createdAt: -1 }).exec();
  }

  async findCategories(
    filter: Record<string, unknown>,
    skip: number,
    limit: number
  ): Promise<{ categories: ICategory[]; total: number }> {
    const [categories, total] = await Promise.all([
      CategoryModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      CategoryModel.countDocuments(filter),
    ]);
    return { categories, total };
  }
}
