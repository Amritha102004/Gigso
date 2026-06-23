import { ICategoryRepository } from "../../interfaces/repositories/gig.repository.interface";
import { IAdminCategoryService } from "../../interfaces/services/admin/category.service.interface";
import { ICategory } from "../../interfaces/gig.interface";

export class AdminCategoryService implements IAdminCategoryService {
  constructor(private _categoryRepo: ICategoryRepository) {}

  async createCategory(name: string, description: string, icon: string): Promise<ICategory> {
    const existing = await this._categoryRepo.findOne({ name: new RegExp(`^${name}$`, "i") });
    if (existing) {
      throw new Error("CATEGORY_ALREADY_EXISTS");
    }
    const category = await this._categoryRepo.create({ name, description, icon } as ICategory);
    return category;
  }

  async updateCategory(
    id: string,
    updateData: Partial<Pick<ICategory, "name" | "description" | "icon">>
  ): Promise<ICategory> {
    if (updateData.name) {
      const existing = await this._categoryRepo.findOne({
        name: new RegExp(`^${updateData.name}$`, "i"),
        _id: { $ne: id },
      });
      if (existing) {
        throw new Error("CATEGORY_ALREADY_EXISTS");
      }
    }
    const updated = await this._categoryRepo.update(id, updateData as Partial<ICategory>);
    if (!updated) {
      throw new Error("CATEGORY_NOT_FOUND");
    }
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    const deleted = await this._categoryRepo.delete(id);
    if (!deleted) {
      throw new Error("CATEGORY_NOT_FOUND");
    }
  }

  async getCategories(
    filter: Record<string, unknown>,
    page: number,
    limit: number
  ): Promise<{ categories: ICategory[]; total: number }> {
    const skip = (page - 1) * limit;
    return this._categoryRepo.findCategories(filter, skip, limit);
  }

  async getCategoryById(id: string): Promise<ICategory> {
    const category = await this._categoryRepo.findById(id);
    if (!category) {
      throw new Error("CATEGORY_NOT_FOUND");
    }
    return category;
  }
}
