import { CategoryModel } from "../models/category.model";
import { ICategory } from "../interfaces/gig.interface";
import { ICategoryRepository } from "../interfaces/repositories/gig.repository.interface";
import { BaseRepository } from "./base.repository";

export class CategoryRepository extends BaseRepository<ICategory> implements ICategoryRepository {
  constructor() {
    super(CategoryModel);
  }

  async findAll(): Promise<ICategory[]> {
    return await CategoryModel.find().exec();
  }
}
