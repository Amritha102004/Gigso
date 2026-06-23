import { Router } from "express";
import { ownerGigController } from "../../config/container";
import { authenticateJWT } from "../../middlewares/auth.middleware";
import { authorizeRoles } from "../../middlewares/role.middleware";
import { requireApproved } from "../../middlewares/approved.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createGigSchema, updateGigSchema } from "../../validations/owner/gig.validation";

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles("owner"));
router.use(requireApproved);

// Categories (must be before :gigId params route)
router.get("/categories", ownerGigController.getCategories.bind(ownerGigController));

// Gigs
router.post("/", validate(createGigSchema), ownerGigController.createGig.bind(ownerGigController));
router.get("/", ownerGigController.getMyGigs.bind(ownerGigController));
router.get("/:gigId", ownerGigController.getGigById.bind(ownerGigController));
router.put("/:gigId", validate(updateGigSchema), ownerGigController.updateGig.bind(ownerGigController));
router.delete("/:gigId", ownerGigController.deleteGig.bind(ownerGigController));
router.patch("/:gigId/publish", ownerGigController.publishGig.bind(ownerGigController));
router.patch("/:gigId/complete", ownerGigController.markAsCompleted.bind(ownerGigController));

export const ownerGigRoutes = router;
