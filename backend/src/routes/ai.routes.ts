import { Router } from "express";
import { aiController } from "../config/container";
import { authenticateJWT } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles("owner", "admin"));

router.post("/match-applicants", aiController.matchApplicants.bind(aiController));

export const aiRoutes = router;
