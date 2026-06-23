import { Router } from "express";
import { workerProfileController } from "../../config/container";
import { authenticateJWT } from "../../middlewares/auth.middleware";
import { authorizeRoles } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { setupWorkerProfileSchema } from "../../validations/worker/profile.validation";

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles("worker"));

router.post("/setup", validate(setupWorkerProfileSchema), workerProfileController.setupWorkerProfile.bind(workerProfileController));
router.get("/me", workerProfileController.getWorkerProfile.bind(workerProfileController));

export const workerProfileRoutes = router;
