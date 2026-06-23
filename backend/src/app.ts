import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { authRoutes } from "./routes/auth/auth.routes";
import { adminUserRoutes } from "./routes/admin/users.routes";
import { workerProfileRoutes } from "./routes/worker/profile.routes";
import { ownerProfileRoutes } from "./routes/owner/profile.routes";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminUserRoutes);
app.use("/api/worker/profile", workerProfileRoutes);
app.use("/api/owner/profile", ownerProfileRoutes);

app.use(errorMiddleware);

export default app;