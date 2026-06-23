import { Request, Response } from "express";
import { IAdminCategoryService } from "../../interfaces/services/admin/category.service.interface";
import { HttpStatus } from "../../utils/http-status.enum";
import { MESSAGES } from "../../constants/messages";
import { ApiResponse } from "../../types/api-response.type";
import { asyncHandler } from "../../utils/asyncHandler";
import { toCategoryDTO } from "../../mappers/category.mapper";

export class AdminCategoryController {
  constructor(private _categoryService: IAdminCategoryService) {}

  public getCategories = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ];
    }

    const result = await this._categoryService.getCategories(filter, page, limit);
    const totalPages = Math.ceil(result.total / limit);
    const mappedCategories = result.categories.map(toCategoryDTO);

    const response: ApiResponse = {
      success: true,
      message: MESSAGES.CATEGORIES_FETCHED,
      data: {
        categories: mappedCategories,
        total: result.total,
        page,
        totalPages
      },
    };

    res.status(HttpStatus.OK).json(response);
  });

  public getCategoryById = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const category = await this._categoryService.getCategoryById(id);

    const response: ApiResponse = {
      success: true,
      message: MESSAGES.CATEGORIES_FETCHED,
      data: { category: toCategoryDTO(category) },
    };

    res.status(HttpStatus.OK).json(response);
  });

  public createCategory = asyncHandler(async (req: Request, res: Response) => {
    const { name, description, icon } = req.body;
    const category = await this._categoryService.createCategory(name, description, icon);

    const response: ApiResponse = {
      success: true,
      message: MESSAGES.CATEGORY_CREATED,
      data: { category: toCategoryDTO(category) },
    };

    res.status(HttpStatus.CREATED).json(response);
  });

  public updateCategory = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;
    const category = await this._categoryService.updateCategory(id, updateData);

    const response: ApiResponse = {
      success: true,
      message: MESSAGES.CATEGORY_UPDATED,
      data: { category: toCategoryDTO(category) },
    };

    res.status(HttpStatus.OK).json(response);
  });

  public deleteCategory = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    await this._categoryService.deleteCategory(id);

    const response: ApiResponse = {
      success: true,
      message: MESSAGES.CATEGORY_DELETED,
    };

    res.status(HttpStatus.OK).json(response);
  });
}
