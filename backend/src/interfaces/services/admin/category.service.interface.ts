import { ICategory } from "../../gig.interface";

export interface IAdminCategoryService {
  createCategory(name: string, description: string, icon: string): Promise<ICategory>;
  updateCategory(id: string, updateData: Partial<Pick<ICategory, "name" | "description" | "icon">>): Promise<ICategory>;
  deleteCategory(id: string): Promise<void>;
  getCategories(
    filter: Record<string, unknown>,
    page: number,
    limit: number
  ): Promise<{ categories: ICategory[]; total: number }>;
  getCategoryById(id: string): Promise<ICategory>;
}
