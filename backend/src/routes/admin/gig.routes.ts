import { Router } from "express";
import { authenticateJWT } from "../../middlewares/auth.middleware";
import { authorizeRoles } from "../../middlewares/role.middleware";
import { adminGigController } from "../../config/container";

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles("admin"));

router.get("/", adminGigController.getAllGigs.bind(adminGigController));
router.get("/:gigId", adminGigController.getGigById.bind(adminGigController));
router.patch("/:gigId/flag", adminGigController.toggleFlagGig.bind(adminGigController));
router.patch("/:gigId/applications/:appId", adminGigController.updateApplicationStatus.bind(adminGigController));
router.delete("/:gigId", adminGigController.deleteGig.bind(adminGigController));

export const adminGigRoutes = router;
