// src/app.ts

import express from "express";
import cors from "cors";
import morgan from "morgan";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";

import router from "./routes";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();

// 🔹 Core Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔹 Logger (dev only)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// 🔹 Swagger U
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 🔹 Health Check (IMPORTANT for Railway)
app.get("/", (_req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Finance Dashboard API running 🚀",
    docs: "/api/docs",
  });
});

// 🔹 API Routes
app.use("/api", router);

// 🔹 404 Handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// 🔹 Global Error Handler (MUST BE LAST)
app.use(errorHandler);

export default app;
