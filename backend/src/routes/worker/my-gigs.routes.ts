import { Router } from "express";
import { applicationController } from "../../config/container";
import { authenticateJWT } from "../../middlewares/auth.middleware";
import { authorizeRoles } from "../../middlewares/role.middleware";

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles("worker"));

router.get("/", applicationController.getWorkerApplications.bind(applicationController));

export const workerMyGigsRoutes = router;
