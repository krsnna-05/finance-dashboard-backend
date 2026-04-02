// src/middlewares/error.middleware.ts

import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error("❌ Error:", err);

  // 🔹 Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // 🔹 Prisma Errors (VERY IMPORTANT)
  if (err.code === "P2002") {
    statusCode = 409;
    message = "Duplicate field value (unique constraint failed)";
  }

  if (err.code === "P2025") {
    statusCode = 404;
    message = "Record not found";
  }

  // 🔹 Zod Validation Errors
  if (err.name === "ZodError") {
    statusCode = 400;
    message = "Validation failed";

    return res.status(statusCode).json({
      success: false,
      message,
      errors: err.errors,
    });
  }

  // 🔹 JWT Errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // 🔹 Final Response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
