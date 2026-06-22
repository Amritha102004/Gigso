import { Router } from "express";
import { profileController } from "../config/container";
import { authenticateJWT } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { setupWorkerProfileSchema, setupOwnerProfileSchema } from "../validations/profile.validation";

const router = Router();

router.use(authenticateJWT);

router.post(
  "/worker/setup",
  authorizeRoles("worker"),
  validate(setupWorkerProfileSchema),
  profileController.setupWorkerProfile.bind(profileController)
);

router.post(
  "/owner/setup",
  authorizeRoles("owner"),
  validate(setupOwnerProfileSchema),
  profileController.setupOwnerProfile.bind(profileController)
);

router.get(
  "/worker/me",
  authorizeRoles("worker"),
  profileController.getWorkerProfile.bind(profileController)
);

router.get(
  "/owner/me",
  authorizeRoles("owner"),
  profileController.getOwnerProfile.bind(profileController)
);

export const profileRoutes = router;
