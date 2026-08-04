import { Router } from "express";
import { chatController } from "../config/container";
import { authenticateJWT } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles("worker", "owner"));

router.get("/rooms", chatController.getChatRooms.bind(chatController));
router.get("/:gigId/:counterpartyId", chatController.getMessages.bind(chatController));
router.post("/:gigId", chatController.sendMessage.bind(chatController));

export const chatRoutes = router;
