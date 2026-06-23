import { Router } from "express";
import { ownerProfileController } from "../../config/container";
import { authenticateJWT } from "../../middlewares/auth.middleware";
import { authorizeRoles } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { setupOwnerProfileSchema } from "../../validations/owner/profile.validation";

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles("owner"));

router.post("/setup", validate(setupOwnerProfileSchema), ownerProfileController.setupOwnerProfile.bind(ownerProfileController));
router.get("/me", ownerProfileController.getOwnerProfile.bind(ownerProfileController));

export const ownerProfileRoutes = router;
