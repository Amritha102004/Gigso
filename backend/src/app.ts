import express from "express";
import cookieParser from "cookie-parser";
import { authRoutes } from "./modules/auth/auth.routes";
import { adminUserRoutes } from "./modules/admin/users/users.routes";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminUserRoutes);

export default app;