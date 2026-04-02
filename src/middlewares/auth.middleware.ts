import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

export type AuthUser = {
  userId: string;
  role: "ADMIN" | "ANALYST" | "VIEWER";
};

const createHttpError = (statusCode: number, message: string) => {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
};

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw createHttpError(401, "Authorization token is required");
    }

    const token = authHeader.split(" ")[1];
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw createHttpError(500, "JWT_SECRET is not configured");
    }

    const payload = jwt.verify(token, jwtSecret) as AuthUser;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true, isActive: true },
    });

    if (!user) {
      throw createHttpError(401, "Invalid token user");
    }

    if (!user.isActive) {
      throw createHttpError(403, "User account is inactive");
    }

    const authReq = req as Request & { user?: AuthUser };
    authReq.user = { userId: user.id, role: user.role };
    return next();
  } catch (error) {
    return next(error);
  }
};
