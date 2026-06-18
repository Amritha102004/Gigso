import { Router } from "express";
import { adminUsersController } from "../config/container";
import { authenticateJWT } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles("admin"));

router.get("/users", adminUsersController.getAllUsers.bind(adminUsersController));
router.get("/owners", adminUsersController.getOwners.bind(adminUsersController));
router.get("/workers", adminUsersController.getWorkers.bind(adminUsersController));
router.get("/users/:id", adminUsersController.getUserById.bind(adminUsersController));

router.patch("/users/:id/approve", adminUsersController.approveOwner.bind(adminUsersController));
router.patch("/users/:id/suspend", adminUsersController.toggleSuspendUser.bind(adminUsersController));

export const adminUserRoutes = router;
