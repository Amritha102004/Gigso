import { Router } from "express";
import { paymentController } from "../config/container";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateJWT);

router.post("/connect", paymentController.createConnectAccount.bind(paymentController));
router.get("/connect/status", paymentController.verifyConnectStatus.bind(paymentController));
router.post("/checkout", paymentController.createCheckoutSession.bind(paymentController));
router.post("/verify", paymentController.verifyPayment.bind(paymentController));
router.get("/history/owner", paymentController.getOwnerPaymentHistory.bind(paymentController));
router.get("/history/worker", paymentController.getWorkerEarningsHistory.bind(paymentController));

export const paymentRoutes = router;
