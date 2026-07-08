import { Router } from "express";
import { authenticateJWT } from "../../middlewares/auth.middleware";
import { authorizeRoles } from "../../middlewares/role.middleware";
import { adminGigController } from "../../config/container";

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles("admin"));

router.get("/", adminGigController.getAllGigs.bind(adminGigController));
router.get("/:id", adminGigController.getGigById.bind(adminGigController));
router.patch("/:id/flag", adminGigController.toggleFlagGig.bind(adminGigController));
router.patch("/:id/applications/:appId", adminGigController.updateApplicationStatus.bind(adminGigController));
router.delete("/:id", adminGigController.deleteGig.bind(adminGigController));

export const adminGigRoutes = router;
