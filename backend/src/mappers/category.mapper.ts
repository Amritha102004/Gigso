import { ICategory } from "../interfaces/gig.interface";
import { CategoryDTO } from "../dtos/category.dto";

export const toCategoryDTO = (category: ICategory): CategoryDTO => {
  return {
    id: category._id.toString(),
    name: category.name,
    description: category.description,
    icon: category.icon,
    createdAt: category.createdAt?.toISOString(),
    updatedAt: category.updatedAt?.toISOString(),
  };
};
