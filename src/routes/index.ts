// src/routes/index.ts

import { Router } from "express";
import authRoutes from "../modules/auth/auth.route";
import dashboardRoutes from "../modules/dashboard/dashboard.route";
import transactionRoutes from "../modules/transactions/transaction.route";
import userRoutes from "../modules/users/user.route";

const router = Router();

// 🔹 Module routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/transactions", transactionRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
