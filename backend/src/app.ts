import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { authRoutes } from "./routes/auth.routes";
import { adminUserRoutes } from "./routes/users.routes";
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

app.use(errorMiddleware);

export default app;