import { Router } from "express";
import { notificationController } from "../config/container";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateJWT);

router.get("/", notificationController.getNotifications.bind(notificationController));
router.put("/read-all", notificationController.markAllAsRead.bind(notificationController));
router.put("/:id/read", notificationController.markAsRead.bind(notificationController));

export const notificationRoutes = router;
