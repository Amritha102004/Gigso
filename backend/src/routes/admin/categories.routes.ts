import { Router } from "express";
import { adminCategoryController } from "../../config/container";
import { authenticateJWT } from "../../middlewares/auth.middleware";
import { authorizeRoles } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createCategorySchema, updateCategorySchema } from "../../validations/admin/category.validation";

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles("admin"));

router.get("/", adminCategoryController.getCategories.bind(adminCategoryController));
router.get("/:id", adminCategoryController.getCategoryById.bind(adminCategoryController));
router.post("/", validate(createCategorySchema), adminCategoryController.createCategory.bind(adminCategoryController));
router.put("/:id", validate(updateCategorySchema), adminCategoryController.updateCategory.bind(adminCategoryController));
router.delete("/:id", adminCategoryController.deleteCategory.bind(adminCategoryController));

export const adminCategoryRoutes = router;
