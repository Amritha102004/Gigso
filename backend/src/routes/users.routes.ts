import { Router } from "express";
import { UserRepository } from "../repositories/user.repository";
import { UsersService } from "../services/users.service";
import { AdminUsersController } from "../controllers/users.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

const usersRepository = new UserRepository();
const usersService = new UsersService(usersRepository);
const usersController = new AdminUsersController(usersService);

router.use(authenticateJWT);
router.use(authorizeRoles("admin"));

router.get("/users", usersController.getAllUsers.bind(usersController));
router.get("/owners", usersController.getOwners.bind(usersController));
router.get("/workers", usersController.getWorkers.bind(usersController));
router.get("/users/:id", usersController.getUserById.bind(usersController));

router.patch("/users/:id/approve", usersController.approveOwner.bind(usersController));
router.patch("/users/:id/suspend", usersController.toggleSuspendUser.bind(usersController));

export const adminUserRoutes = router;
