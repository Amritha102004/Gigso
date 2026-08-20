import { Router } from "express";
import { workerGigController, applicationController } from "../../config/container";
import { authenticateJWT } from "../../middlewares/auth.middleware";
import { authorizeRoles } from "../../middlewares/role.middleware";

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles("worker"));

router.get("/categories", workerGigController.getCategories.bind(workerGigController));
router.get("/dashboard/stats", workerGigController.getDashboardStats.bind(workerGigController));
router.get("/", workerGigController.browseGigs.bind(workerGigController));
router.get("/:gigId", workerGigController.getGigById.bind(workerGigController));
router.post("/:gigId/apply", applicationController.applyForGigRole.bind(applicationController));

export const workerGigRoutes = router;
