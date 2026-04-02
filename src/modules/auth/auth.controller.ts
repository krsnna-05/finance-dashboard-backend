import type { NextFunction, Request, Response } from "express";
import { loginService } from "./auth.service";
import { loginSchema } from "./auth.validation";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const data = await loginService(email, password);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data,
    });
  } catch (error) {
    return next(error);
  }
};
