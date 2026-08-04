import { Router } from "express";
import { announcementController } from "../config/container";
import { authenticateJWT } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles("worker", "owner"));

router.get("/:gigId", announcementController.getAnnouncements.bind(announcementController));
router.post("/:gigId", announcementController.createAnnouncement.bind(announcementController));

export const announcementRoutes = router;
