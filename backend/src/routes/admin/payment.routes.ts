import { Router } from "express";
import { adminPaymentController } from "../../config/container";
import { authenticateJWT } from "../../middlewares/auth.middleware";
import { authorizeRoles } from "../../middlewares/role.middleware";

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles("admin"));

// Fetch admin dashboard revenue statistics & recent logs
router.get("/dashboard", adminPaymentController.getDashboardStats.bind(adminPaymentController));

// Fetch paginated transactions list with status & search filters
router.get("/", adminPaymentController.getTransactionsList.bind(adminPaymentController));

// Fetch specific invoice and payout logs details
router.get("/:id", adminPaymentController.getTransactionDetails.bind(adminPaymentController));

export const adminPaymentRoutes = router;
