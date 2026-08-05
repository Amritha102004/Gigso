import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { authRoutes } from "./routes/auth/auth.routes";
import { adminUserRoutes } from "./routes/admin/users.routes";
import { adminCategoryRoutes } from "./routes/admin/categories.routes";
import { adminGigRoutes } from "./routes/admin/gig.routes";
import { workerProfileRoutes } from "./routes/worker/profile.routes";
import { ownerProfileRoutes } from "./routes/owner/profile.routes";
import { ownerGigRoutes } from "./routes/owner/gig.routes";
import { workerGigRoutes } from "./routes/worker/gig.routes";
import { workerMyGigsRoutes } from "./routes/worker/my-gigs.routes";
import { notificationRoutes } from "./routes/notification.routes";
import { chatRoutes } from "./routes/chat.routes";
import { announcementRoutes } from "./routes/announcement.routes";
import { paymentRoutes } from "./routes/payment.routes";
import { reviewRoutes } from "./routes/review.routes";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminUserRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api/admin/gigs", adminGigRoutes);
app.use("/api/worker/profile", workerProfileRoutes);
app.use("/api/worker/gigs", workerGigRoutes);
app.use("/api/worker/my-gigs", workerMyGigsRoutes);
app.use("/api/owner/profile", ownerProfileRoutes);
app.use("/api/owner/gigs", ownerGigRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);

app.use(errorMiddleware);

export default app;