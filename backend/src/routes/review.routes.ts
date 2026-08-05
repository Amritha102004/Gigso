import { Router } from "express";
import { reviewController } from "../config/container";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();

// Submit review for a completed gig
router.post("/", authenticateJWT, reviewController.submitReview);

// Fetch paginated reviews list for a user
router.get("/user/:userId", authenticateJWT, reviewController.getUserReviews);

// Fetch average rating summary stats for a user
router.get("/summary/:userId", authenticateJWT, reviewController.getUserSummary);

// Fetch hired workers for a gig to review them
router.get("/gig/:gigId/workers", authenticateJWT, reviewController.getHiredWorkers);

export const reviewRoutes = router;
