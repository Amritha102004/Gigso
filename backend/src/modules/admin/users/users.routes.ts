import { Router } from "express";
import { AdminUsersRepository } from "./users.repository";
import { AdminUsersService } from "./users.service";
import { AdminUsersController } from "./users.controller";
import { authenticateJWT } from "../../../middlewares/auth.middleware";
import { authorizeRoles } from "../../../middlewares/role.middleware";

const router = Router();

// DI Wiring
const usersRepository = new AdminUsersRepository();
const usersService = new AdminUsersService(usersRepository);
const usersController = new AdminUsersController(usersService);

// Apply strict Admin middlewares globally to this exact router level
router.use(authenticateJWT);
router.use(authorizeRoles("admin"));

// Map exact paths avoiding overlaps (placing static paths above dynamic :id)
router.get("/users", usersController.getAllUsers.bind(usersController));
router.get("/owners", usersController.getOwners.bind(usersController));
router.get("/workers", usersController.getWorkers.bind(usersController));
router.get("/users/:id", usersController.getUserById.bind(usersController));

// Action verbs
router.patch("/users/:id/approve", usersController.approveOwner.bind(usersController));
router.patch("/users/:id/suspend", usersController.toggleSuspendUser.bind(usersController));

export const adminUserRoutes = router;
