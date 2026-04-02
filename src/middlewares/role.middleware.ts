import type { NextFunction, Request, Response } from "express";

type Role = "ADMIN" | "ANALYST" | "VIEWER";

const createHttpError = (statusCode: number, message: string) => {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
};

export const authorize = (allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const authReq = req as Request & { user?: { role: Role; userId: string } };

    if (!authReq.user) {
      return next(createHttpError(401, "Unauthorized"));
    }

    if (!allowedRoles.includes(authReq.user.role)) {
      return next(createHttpError(403, "Forbidden"));
    }

    return next();
  };
};
